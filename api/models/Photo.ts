import mongoose, { Document, Schema } from 'mongoose';

// 照片接口定义
export interface IPhoto extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  originalFileName: string;
  fileSize: number;
  dimensions: {
    width: number;
    height: number;
  };
  camera?: {
    make?: string;
    model?: string;
    lens?: string;
  };
  settings?: {
    iso?: number;
    aperture?: string;
    shutterSpeed?: string;
    focalLength?: string;
  };
  location?: {
    name?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  tags: string[];
  category: string;
  isPublic: boolean;
  allowComments: boolean;
  allowDownload: boolean;
  author: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// 照片Schema定义
const PhotoSchema = new Schema<IPhoto>({
  title: {
    type: String,
    required: [true, 'Photo title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  },
  thumbnailUrl: {
    type: String
  },
  originalFileName: {
    type: String,
    required: [true, 'Original file name is required']
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required']
  },
  dimensions: {
    width: {
      type: Number,
      required: [true, 'Image width is required']
    },
    height: {
      type: Number,
      required: [true, 'Image height is required']
    }
  },
  camera: {
    make: String,
    model: String,
    lens: String
  },
  settings: {
    iso: Number,
    aperture: String,
    shutterSpeed: String,
    focalLength: String
  },
  location: {
    name: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['portrait', 'landscape', 'street', 'nature', 'architecture', 'macro', 'abstract', 'documentary', 'fashion', 'sports', 'wildlife', 'travel', 'other'],
      message: 'Invalid category'
    },
    default: 'other'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  allowComments: {
    type: Boolean,
    default: true
  },
  allowDownload: {
    type: Boolean,
    default: false
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  viewsCount: {
    type: Number,
    default: 0
  },
  downloadCount: {
    type: Number,
    default: 0
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

// 索引
PhotoSchema.index({ author: 1, createdAt: -1 });
PhotoSchema.index({ category: 1, createdAt: -1 });
PhotoSchema.index({ tags: 1 });
PhotoSchema.index({ isPublic: 1, createdAt: -1 });
PhotoSchema.index({ likesCount: -1 });
PhotoSchema.index({ viewsCount: -1 });
PhotoSchema.index({ createdAt: -1 });
PhotoSchema.index({ 'location.coordinates': '2dsphere' }); // 地理位置索引

// 文本搜索索引
PhotoSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
});

// 虚拟字段
PhotoSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

PhotoSchema.set('toJSON', {
  virtuals: true
});

// 中间件：删除照片时清理相关数据
PhotoSchema.pre('deleteOne', { document: true, query: false }, async function() {
  try {
    // 删除相关的评论和点赞记录
    await mongoose.model('Comment').deleteMany({ photo: this._id });
    await mongoose.model('Like').deleteMany({ photo: this._id });
    
    // 更新作者的照片数量
    await mongoose.model('User').findByIdAndUpdate(
      this.author,
      { $inc: { photosCount: -1 } }
    );
  } catch (error) {
    console.error('Error in photo pre-delete middleware:', error);
  }
});

export default mongoose.model<IPhoto>('Photo', PhotoSchema);