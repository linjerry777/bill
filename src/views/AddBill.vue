<template>
  <div class="add-bill">
    <header class="header">
      <router-link to="/" class="back-button">
        <i class="fas fa-chevron-left"></i>
      </router-link>
      <h1>记一笔</h1>
    </header>

    <form @submit.prevent="submitBill" class="bill-form">
      <div class="role-selector">
        <button 
          type="button"
          :class="['role-btn', { active: selectedRole === 'husband' }]"
          @click="selectedRole = 'husband'"
        >
          <i class="fas fa-male"></i>
          <span>老公</span>
        </button>
        <button 
          type="button"
          :class="['role-btn', { active: selectedRole === 'wife' }]"
          @click="selectedRole = 'wife'"
        >
          <i class="fas fa-female"></i>
          <span>老婆</span>
        </button>
      </div>

      <div class="type-selector">
        <button 
          type="button"
          :class="['type-btn', { active: billType === 'expense' }]"
          @click="billType = 'expense'"
        >
          支出
        </button>
        <button 
          type="button"
          :class="['type-btn', { active: billType === 'income' }]"
          @click="billType = 'income'"
        >
          收入
        </button>
      </div>

      <div class="input-group">
        <label>金额</label>
        <input 
          type="number" 
          v-model="amount"
          placeholder="请输入金额"
          step="0.01"
          required
          class="glass-input"
        >
      </div>

      <div class="input-group">
        <label>类别</label>
        <select v-model="category" required class="glass-input">
          <option value="" disabled>请选择类别</option>
          <option v-for="cat in categories[billType]" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>
      </div>

      <div class="input-group">
        <label>描述</label>
        <input 
          type="text" 
          v-model="description"
          placeholder="添加描述（选填）"
          class="glass-input"
        >
      </div>

      <button type="submit" class="submit-btn">保存</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const billType = ref('expense')
const amount = ref('')
const category = ref('')
const description = ref('')
const selectedRole = ref('husband')

const categories = {
  expense: ['餐饮', '交通', '购物', '娱乐', '居住', '医疗', '教育', '其他'],
  income: ['工资', '奖金', '投资', '兼职', '其他']
}

const submitBill = async () => {
  try {
    await axios.post('http://localhost:3000/api/bills', {
      amount: Number(amount.value),
      category: category.value,
      description: description.value,
      type: billType.value,
      role: selectedRole.value
    })
    router.push('/')
  } catch (error) {
    console.error('Error adding bill:', error)
  }
}
</script>

<style scoped>
.add-bill {
  min-height: 100vh;
  background-color: #000;
  color: #fff;
}

.header {
  padding: 20px;
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-button {
  color: #2997ff;
  text-decoration: none;
  margin-right: 20px;
}

.header h1 {
  font-size: 24px;
  font-weight: 500;
}

.bill-form {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.role-selector,
.type-selector {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
}

.role-btn,
.type-btn {
  flex: 1;
  padding: 15px;
  border: none;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.role-btn i {
  font-size: 24px;
}

.role-btn.active,
.type-btn.active {
  background: #2997ff;
}

.input-group {
  margin-bottom: 25px;
}

.input-group label {
  display: block;
  margin-bottom: 10px;
  color: #86868b;
  font-size: 14px;
}

.glass-input {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.glass-input option {
  background: #1c1c1e;
  color: #fff;
  padding: 10px;
}

.glass-input option:disabled {
  color: #86868b;
}

.glass-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.15);
}

.glass-input::placeholder {
  color: #86868b;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  background: #2997ff;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
}

.submit-btn:hover {
  background: #0077ed;
}

.submit-btn:active {
  transform: scale(0.98);
}

@media (hover: hover) {
  .role-btn:hover,
  .type-btn:hover {
    background: rgba(255, 255, 255, 0.15);
  }
}
</style> 