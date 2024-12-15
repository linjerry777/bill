import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// 连接MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bill-tracker')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// 账单模型
const Bill = mongoose.model('Bill', {
  amount: Number,
  category: String,
  description: String,
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ['expense', 'income'] },
  role: { type: String, enum: ['husband', 'wife'], required: true }
});

// 迁移函数
async function migrate() {
  try {
    // 更新所有没有role字段的记录
    const result = await Bill.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'husband' } }
    );

    console.log(`已更新 ${result.modifiedCount} 条记录`);
    process.exit(0);
  } catch (error) {
    console.error('迁移错误:', error);
    process.exit(1);
  }
}

migrate(); 