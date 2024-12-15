<template>
  <div class="statistics">
    <header class="header">
      <router-link to="/" class="back-button">
        <i class="fas fa-chevron-left"></i>
      </router-link>
      <h1>消费分析</h1>
    </header>

    <div class="stats-container">
      <div class="summary-section">
        <h2>本月概览</h2>
        <div class="summary-cards">
          <div class="card expense">
            <div class="card-content">
              <h3>总支出</h3>
              <p class="amount">¥{{ monthlyExpense }}</p>
            </div>
            <i class="fas fa-arrow-down"></i>
          </div>
          <div class="card income">
            <div class="card-content">
              <h3>总收入</h3>
              <p class="amount">¥{{ monthlyIncome }}</p>
            </div>
            <i class="fas fa-arrow-up"></i>
          </div>
        </div>

        <div class="role-stats">
          <div class="role-card husband">
            <i class="fas fa-male"></i>
            <div class="role-info">
              <span class="role-label">老公支出</span>
              <span class="role-amount">¥{{ husbandExpense }}</span>
              <div class="progress-bar">
                <div class="progress" 
                     :style="{ width: (husbandExpense / monthlyExpense * 100) + '%' }">
                </div>
              </div>
            </div>
          </div>
          <div class="role-card wife">
            <i class="fas fa-female"></i>
            <div class="role-info">
              <span class="role-label">老婆支出</span>
              <span class="role-amount">¥{{ wifeExpense }}</span>
              <div class="progress-bar">
                <div class="progress" 
                     :style="{ width: (wifeExpense / monthlyExpense * 100) + '%' }">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="category-section">
        <h2>支出分类</h2>
        <div class="category-list">
          <div v-for="(amount, category) in expenseByCategory" 
               :key="category" 
               class="category-item">
            <div class="category-icon">
              <i class="fas" :class="getCategoryIcon(category)"></i>
            </div>
            <div class="category-info">
              <div class="category-header">
                <span class="category-name">{{ category }}</span>
                <span class="category-amount">¥{{ amount }}</span>
              </div>
              <div class="progress-bar">
                <div class="progress" 
                     :style="{ width: (amount / monthlyExpense * 100) + '%' }">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const bills = ref([])

const fetchBills = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/bills')
    bills.value = response.data
  } catch (error) {
    console.error('Error fetching bills:', error)
  }
}

const isCurrentMonth = (date) => {
  const billDate = new Date(date)
  const now = new Date()
  return billDate.getMonth() === now.getMonth() && 
         billDate.getFullYear() === now.getFullYear()
}

const monthlyExpense = computed(() => {
  return bills.value
    .filter(bill => bill.type === 'expense' && isCurrentMonth(bill.date))
    .reduce((sum, bill) => sum + bill.amount, 0)
})

const monthlyIncome = computed(() => {
  return bills.value
    .filter(bill => bill.type === 'income' && isCurrentMonth(bill.date))
    .reduce((sum, bill) => sum + bill.amount, 0)
})

const husbandExpense = computed(() => {
  return bills.value
    .filter(bill => 
      bill.role === 'husband' && 
      bill.type === 'expense' && 
      isCurrentMonth(bill.date)
    )
    .reduce((sum, bill) => sum + bill.amount, 0)
})

const wifeExpense = computed(() => {
  return bills.value
    .filter(bill => 
      bill.role === 'wife' && 
      bill.type === 'expense' && 
      isCurrentMonth(bill.date)
    )
    .reduce((sum, bill) => sum + bill.amount, 0)
})

const expenseByCategory = computed(() => {
  const categories = {}
  bills.value
    .filter(bill => bill.type === 'expense' && isCurrentMonth(bill.date))
    .forEach(bill => {
      categories[bill.category] = (categories[bill.category] || 0) + bill.amount
    })
  return categories
})

const getCategoryIcon = (category) => {
  const icons = {
    '餐饮': 'fa-utensils',
    '交通': 'fa-car',
    '购物': 'fa-shopping-bag',
    '娱乐': 'fa-gamepad',
    '居住': 'fa-home',
    '医疗': 'fa-hospital',
    '教育': 'fa-graduation-cap',
    '其他': 'fa-ellipsis-h'
  }
  return icons[category] || 'fa-tag'
}

onMounted(() => {
  fetchBills()
})
</script>

<style scoped>
.statistics {
  min-height: 100vh;
  background-color: #000;
  color: #fff;
}

.header {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  padding: 20px;
  display: flex;
  align-items: center;
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

.stats-container {
  padding: 20px;
}

.summary-section,
.category-section {
  margin-bottom: 30px;
}

h2 {
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 20px;
  color: #fff;
}

.summary-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.card {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card.expense {
  color: #ff375f;
}

.card.income {
  color: #30d158;
}

.card h3 {
  font-size: 14px;
  color: #86868b;
  margin-bottom: 5px;
}

.card .amount {
  font-size: 24px;
  font-weight: 500;
}

.role-stats {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.role-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 15px;
}

.role-card i {
  font-size: 24px;
  color: #2997ff;
}

.role-info {
  flex: 1;
}

.role-label {
  font-size: 14px;
  color: #86868b;
}

.role-amount {
  display: block;
  font-size: 20px;
  font-weight: 500;
  margin: 5px 0;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.category-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #2997ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.category-info {
  flex: 1;
}

.category-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.category-name {
  color: #fff;
}

.category-amount {
  color: #86868b;
}

.progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: #2997ff;
  border-radius: 2px;
  transition: width 0.3s ease;
}
</style> 