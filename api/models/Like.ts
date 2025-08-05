import mongoose, { Document, Schema } from 'mongoose';

// 点赞接口定义
export interface ILike extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  targetType: 'Photo' | 'Comment';
  targetId: mongoose.Types.ObjectId;
  photo?: mongoose.Types.ObjectId; // 如果是评论点赞，记录所属照片
  comment?: mongoose.Types.ObjectId; // 如果是评论点赞，记录评论ID
  createdAt: Date;
  updatedAt: Date;
}

// 点赞Schema定义
const LikeSchema = new Schema<ILike>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  targetType: {
    type: String,
    required: [true, 'Target type is required'],
    enum: {
      values: ['Photo', 'Comment'],
      message: 'Target type must be either Photo or Comment'
    }
  },
  targetId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Target ID is required']
  },
  photo: {
    type: Schema.Types.ObjectId,
    ref: 'Photo'
  },
  comment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment'
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

// 复合索引：确保用户不能重复点赞同一个目标
LikeSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

// 其他索引
LikeSchema.index({ user: 1, createdAt: -1 });
LikeSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
LikeSchema.index({ photo: 1, createdAt: -1 });
LikeSchema.index({ comment: 1, createdAt: -1 });

// 虚拟字段
LikeSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

LikeSchema.set('toJSON', {
  virtuals: true
});

// 中间件：保存点赞时更新目标的点赞数量
LikeSchema.post('save', async function() {
  try {
    if (this.targetType === 'Photo') {
      await mongoose.model('Photo').findByIdAndUpdate(
        this.targetId,
        { 
          $inc: { likesCount: 1 },
          $addToSet: { likes: this.user }
        }
      );
    } else if (this.targetType === 'Comment') {
      await mongoose.model('Comment').findByIdAndUpdate(
        this.targetId,
        { 
          $inc: { likesCount: 1 },
          $addToSet: { likes: this.user }
        }
      );
    }
  } catch (error) {
    console.error('Error in like post-save middleware:', error);
  }
});

// 中间件：删除点赞时更新目标的点赞数量
LikeSchema.pre('deleteOne', { document: true, query: false }, async function() {
  try {
    if (this.targetType === 'Photo') {
      await mongoose.model('Photo').findByIdAndUpdate(
        this.targetId,
        { 
          $inc: { likesCount: -1 },
          $pull: { likes: this.user }
        }
      );
    } else if (this.targetType === 'Comment') {
      await mongoose.model('Comment').findByIdAndUpdate(
        this.targetId,
        { 
          $inc: { likesCount: -1 },
          $pull: { likes: this.user }
        }
      );
    }
  } catch (error) {
    console.error('Error in like pre-delete middleware:', error);
  }
});

// 静态方法：切换点赞状态
LikeSchema.statics.toggleLike = async function(
  userId: mongoose.Types.ObjectId,
  targetType: 'Photo' | 'Comment',
  targetId: mongoose.Types.ObjectId,
  photoId?: mongoose.Types.ObjectId
) {
  try {
    const existingLike = await this.findOne({
      user: userId,
      targetType,
      targetId
    });

    if (existingLike) {
      // 如果已经点赞，则取消点赞
      await existingLike.deleteOne();
      return { liked: false, like: null };
    } else {
      // 如果未点赞，则添加点赞
      const likeData: any = {
        user: userId,
        targetType,
        targetId
      };

      if (targetType === 'Photo') {
        likeData.photo = targetId;
      } else if (targetType === 'Comment') {
        likeData.comment = targetId;
        if (photoId) {
          likeData.photo = photoId;
        }
      }

      const newLike = await this.create(likeData);
      return { liked: true, like: newLike };
    }
  } catch (error) {
    throw error;
  }
};

// 静态方法：检查用户是否已点赞
LikeSchema.statics.isLikedByUser = async function(
  userId: mongoose.Types.ObjectId,
  targetType: 'Photo' | 'Comment',
  targetId: mongoose.Types.ObjectId
) {
  try {
    const like = await this.findOne({
      user: userId,
      targetType,
      targetId
    });
    return !!like;
  } catch (error) {
    throw error;
  }
};

// 静态方法：获取用户的点赞列表
LikeSchema.statics.getUserLikes = async function(
  userId: mongoose.Types.ObjectId,
  targetType?: 'Photo' | 'Comment',
  page: number = 1,
  limit: number = 20
) {
  try {
    const query: any = { user: userId };
    if (targetType) {
      query.targetType = targetType;
    }

    const likes = await this.find(query)
      .populate('photo', 'title imageUrl thumbnailUrl author')
      .populate('comment', 'content author photo')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await this.countDocuments(query);

    return {
      likes,
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

export default mongoose.model<ILike>('Like', Li