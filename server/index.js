import express from 'express'; 
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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

// API路由
app.get('/api/bills', async (req, res) => {
  try {
    const bills = await Bill.find().sort({ date: -1 });
    // 处理旧数据，为没有role字段的数据添加默认值
    const processedBills = bills.map(bill => {
      const billObj = bill.toObject();
      if (!billObj.role) {
        billObj.role = 'husband'; // 为旧数据设置默认值
      }
      return billObj;
    });
    res.json(processedBills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/bills', async (req, res) => {
  try {
    const bill = new Bill(req.body);
    await bill.save();
    res.status(201).json(bill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 添加删除账单的API
app.delete('/api/bills/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: '无效的账单ID' });
    }
    
    const bill = await Bill.findByIdAndDelete(id);
    if (!bill) {
      return res.status(404).json({ message: '账单不存在' });
    }
    res.status(200).json({ message: '账单已删除', deletedBill: bill });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 