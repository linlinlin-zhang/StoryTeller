import mongoose, { Document, Schema, Model } from 'mongoose';

// 关注接口定义
export interface IFollow extends Document {
  _id: mongoose.Types.ObjectId;
  follower: mongoose.Types.ObjectId; // 关注者
  following: mongoose.Types.ObjectId; // 被关注者
  createdAt: Date;
  updatedAt: Date;
}

// 静态方法接口
export interface IFollowModel extends Model<IFollow> {
  toggleFollow(followerId: mongoose.Types.ObjectId, followingId: mongoose.Types.ObjectId): Promise<{ following: boolean; follow: IFollow | null }>;
  isFollowing(followerId: mongoose.Types.ObjectId, followingId: mongoose.Types.ObjectId): Promise<boolean>;
  getFollowing(userId: mongoose.Types.ObjectId, page?: number, limit?: number): Promise<any>;
  getFollowers(userId: mongoose.Types.ObjectId, page?: number, limit?: number): Promise<any>;
  getMutualFollows(userId: mongoose.Types.ObjectId, page?: number, limit?: number): Promise<any>;
}

// 关注Schema定义
const FollowSchema = new Schema<IFollow>({
  follower: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Follower is required']
  },
  following: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Following user is required']
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// 复合索引：确保用户不能重复关注同一个人
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

// 其他索引
FollowSchema.index({ follower: 1, createdAt: -1 });
FollowSchema.index({ following: 1, createdAt: -1 });

// 虚拟字段
FollowSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

FollowSchema.set('toJSON', {
  virtuals: true
});

// 验证：用户不能关注自己
FollowSchema.pre('save', function(next) {
  if (this.follower.equals(this.following)) {
    const error = new Error('Users cannot follow themselves');
    return next(error);
  }
  next();
});

// 中间件：保存关注关系时更新用户的关注数量
FollowSchema.post('save', async function() {
  try {
    // 更新关注者的关注数量
    await mongoose.model('User').findByIdAndUpdate(
      this.follower,
      { 
        $inc: { followingCount: 1 },
        $addToSet: { following: this.following }
      }
    );
    
    // 更新被关注者的粉丝数量
    await mongoose.model('User').findByIdAndUpdate(
      this.following,
      { 
        $inc: { followersCount: 1 },
        $addToSet: { followers: this.follower }
      }
    );
  } catch (error) {
    console.error('Error in follow post-save middleware:', error);
  }
});

// 中间件：删除关注关系时更新用户的关注数量
FollowSchema.pre('deleteOne', { document: true, query: false }, async function() {
  try {
    // 更新关注者的关注数量
    await mongoose.model('User').findByIdAndUpdate(
      this.follower,
      { 
        $inc: { followingCount: -1 },
        $pull: { following: this.following }
      }
    );
    
    // 更新被关注者的粉丝数量
    await mongoose.model('User').findByIdAndUpdate(
      this.following,
      { 
        $inc: { followersCount: -1 },
        $pull: { followers: this.follower }
      }
    );
  } catch (error) {
    console.error('Error in follow pre-delete middleware:', error);
  }
});

// 静态方法：切换关注状态
FollowSchema.statics.toggleFollow = async function(
  followerId: mongoose.Types.ObjectId,
  followingId: mongoose.Types.ObjectId
) {
  try {
    // 检查是否已经关注
    const existingFollow = await this.findOne({
      follower: followerId,
      following: followingId
    });

    if (existingFollow) {
      // 如果已经关注，则取消关注
      await existingFollow.deleteOne();
      return { following: false, follow: null };
    } else {
      // 如果未关注，则添加关注
      const newFollow = await this.create({
        follower: followerId,
        following: followingId
      });
      return { following: true, follow: newFollow };
    }
  } catch (error) {
    throw error;
  }
};

// 静态方法：检查用户是否已关注
FollowSchema.statics.isFollowing = async function(
  followerId: mongoose.Types.ObjectId,
  followingId: mongoose.Types.ObjectId
) {
  try {
    const follow = await this.findOne({
      follower: followerId,
      following: followingId
    });
    return !!follow;
  } catch (error) {
    throw error;
  }
};

// 静态方法：获取用户的关注列表
FollowSchema.statics.getFollowing = async function(
  userId: mongoose.Types.ObjectId,
  page: number = 1,
  limit: number = 20
) {
  try {
    const follows = await this.find({ follower: userId })
      .populate('following', 'username avatar bio followersCount photosCount')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await this.countDocuments({ follower: userId });

    return {
      following: follows.map(f => f.following),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw error;
  }
};

// 静态方法：获取用户的粉丝列表
FollowSchema.statics.getFollowers = async function(
  userId: mongoose.Types.ObjectId,
  page: number = 1,
  limit: number = 20
) {
  try {
    const follows = await this.find({ following: userId })
      .populate('follower', 'username avatar bio followersCount photosCount')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await this.countDocuments({ following: userId });

    return {
      followers: follows.map(f => f.follower),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw error;
  }
};

// 静态方法：获取互相关注的用户
FollowSchema.statics.getMutualFollows = async function(
  userId: mongoose.Types.ObjectId,
  page: number = 1,
  limit: number = 20
) {
  try {
    // 查找用户关注的人
    const following = await this.find({ follower: userId }).select('following');
    const followingIds = following.map(f => f.following);

    // 查找这些人中也关注了该用户的
    const mutualFollows = await this.find({
      follower: { $in: followingIds },
      following: userId
    })
    .populate('follower', 'username avatar bio followersCount photosCount')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

    const total = await this.countDocuments({
      follower: { $in: followingIds },
      following: userId
    });

    return {
      mutualFollows: mutualFollows.map(f => f.follower),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw error;
  }
};

export default mongoose.model<IFollow>('Follow', FollowSchema);