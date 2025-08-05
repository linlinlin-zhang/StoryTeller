import mongoose, { Document, Schema } from 'mongoose';

// 评论接口定义
export interface IComment extends Document {
  _id: mongoose.Types.ObjectId;
  content: string;
  author: mongoose.Types.ObjectId;
  photo: mongoose.Types.ObjectId;
  parentComment?: mongoose.Types.ObjectId; // 父评论ID，用于回复功能
  replies: mongoose.Types.ObjectId[]; // 子评论ID数组
  likes: mongoose.Types.ObjectId[];
  likesCount: number;
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 评论Schema定义
const CommentSchema = new Schema<IComment>({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    minlength: [1, 'Comment cannot be empty'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Comment author is required']
  },
  photo: {
    type: Schema.Types.ObjectId,
    ref: 'Photo',
    required: [true, 'Photo reference is required']
  },
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  replies: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      // 如果评论被删除，隐藏内容
      if (ret.isDeleted) {
        ret.content = '[This comment has been deleted]';
      }
      return ret;
    }
  }
});

// 索引
CommentSchema.index({ photo: 1, createdAt: -1 });
CommentSchema.index({ author: 1, createdAt: -1 });
CommentSchema.index({ parentComment: 1, createdAt: 1 });
CommentSchema.index({ isDeleted: 1 });
CommentSchema.index({ likesCount: -1 });

// 虚拟字段
CommentSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

CommentSchema.set('toJSON', {
  virtuals: true
});

// 中间件：保存评论时更新照片的评论数量
CommentSchema.post('save', async function() {
  try {
    if (!this.isDeleted && !this.parentComment) {
      // 只有顶级评论才计入照片的评论数量
      await mongoose.model('Photo').findByIdAndUpdate(
        this.photo,
        { $inc: { commentsCount: 1 } }
      );
    }
    
    // 如果是回复评论，更新父评论的回复数组
    if (this.parentComment) {
      await mongoose.model('Comment').findByIdAndUpdate(
        this.parentComment,
        { $addToSet: { replies: this._id } }
      );
    }
  } catch (error) {
    console.error('Error in comment post-save middleware:', error);
  }
});

// 中间件：删除评论时更新相关数据
CommentSchema.pre('deleteOne', { document: true, query: false }, async function() {
  try {
    // 软删除：标记为已删除而不是真正删除
    this.isDeleted = true;
    this.deletedAt = new Date();
    await this.save();
    
    // 更新照片的评论数量（只有顶级评论才计入）
    if (!this.parentComment) {
      await mongoose.model('Photo').findByIdAndUpdate(
        this.photo,
        { $inc: { commentsCount: -1 } }
      );
    }
    
    // 如果是父评论被删除，处理子评论
    if (this.replies && this.replies.length > 0) {
      await mongoose.model('Comment').updateMany(
        { _id: { $in: this.replies } },
        { 
          isDeleted: true,
          deletedAt: new Date()
        }
      );
    }
    
    // 如果是回复评论，从父评论的回复数组中移除
    if (this.parentComment) {
      await mongoose.model('Comment').findByIdAndUpdate(
        this.parentComment,
        { $pull: { replies: this._id } }
      );
    }
  } catch (error) {
    console.error('Error in comment pre-delete middleware:', error);
  }
});

// 中间件：更新评论时设置编辑标记
CommentSchema.pre('findOneAndUpdate', function() {
  const update = this.getUpdate() as any;
  if (update && update.content) {
    update.isEdited = true;
    update.editedAt = new Date();
  }
});

export default mongoose.model<IComment>('Comment', CommentSchema);