<template>
  <div class="home">
    <header class="header">
      <h1>家庭账本</h1>
      <div class="balance-cards">
        <div class="balance-card total">
          <span class="label">总余额</span>
          <h2>¥ {{ totalBalance }}</h2>
        </div>
        <div class="balance-card">
          <span class="label">老公支出</span>
          <h3>¥ {{ husbandExpense }}</h3>
        </div>
        <div class="balance-card">
          <span class="label">老婆支出</span>
          <h3>¥ {{ wifeExpense }}</h3>
        </div>
      </div>
    </header>

    <div class="bill-list">
      <div v-for="(group, date) in groupedBills" :key="date" class="bill-group">
        <div class="date-header">{{ formatDate(date) }}</div>
        <div v-for="bill in group" 
             :key="bill._id" 
             class="bill-item-wrapper"
             :class="{ 'show-delete': isShowDelete(bill._id) }"
             @touchstart="touchStart($event, bill._id)"
             @touchmove="touchMove($event, bill._id)"
             @touchend="touchEnd(bill._id)">
          <div class="bill-item">
            <div class="bill-info">
              <div class="category-icon" :class="bill.type">
                <i class="fas" :class="getCategoryIcon(bill.category)"></i>
              </div>
              <div class="bill-details">
                <span class="category">{{ bill.category }}</span>
                <span class="description">{{ bill.description }}</span>
              </div>
              <div class="role-indicator">
                <i :class="['fas', bill.role === 'husband' ? 'fa-male' : 'fa-female']"></i>
              </div>
            </div>
            <div class="amount" :class="{ 'income': bill.type === 'income' }">
              {{ bill.type === 'income' ? '+' : '-' }}¥{{ bill.amount }}
            </div>
          </div>
          <div class="delete-button" @click="deleteBill(bill._id)">
            <i class="fas fa-trash-alt"></i>
            删除
          </div>
        </div>
      </div>
    </div>

    <nav class="bottom-nav">
      <router-link to="/" class="nav-item active">
        <i class="fas fa-home"></i>
        <span>首页</span>
      </router-link>
      <router-link to="/add" class="nav-item add-button">
        <i class="fas fa-plus"></i>
      </router-link>
      <router-link to="/statistics" class="nav-item">
        <i class="fas fa-chart-pie"></i>
        <span>统计</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const bills = ref([])
const touchStartX = ref(0)
const touchCurrentX = ref(0)
const activeItemId = ref(null)
const showDeleteItems = ref(new Set())
const deleteThreshold = -50 // 显示删除按钮的阈值

const touchStart = (event, itemId) => {
  touchStartX.value = event.touches[0].clientX
  touchCurrentX.value = event.touches[0].clientX
  activeItemId.value = itemId
}

const touchMove = (event, itemId) => {
  if (activeItemId.value === itemId) {
    touchCurrentX.value = event.touches[0].clientX
    const diff = touchCurrentX.value - touchStartX.value
    if (diff < deleteThreshold && !showDeleteItems.value.has(itemId)) {
      showDeleteItems.value.add(itemId)
    } else if (diff >= 0 && showDeleteItems.value.has(itemId)) {
      showDeleteItems.value.delete(itemId)
    }
  }
}

const touchEnd = (itemId) => {
  if (activeItemId.value === itemId) {
    const diff = touchCurrentX.value - touchStartX.value
    if (diff >= -30) {
      showDeleteItems.value.delete(itemId)
    }
    activeItemId.value = null
  }
}

const isShowDelete = (itemId) => {
  return showDeleteItems.value.has(itemId)
}

const deleteBill = async (billId) => {
  try {
    const response = await axios.delete(`http://localhost:3000/api/bills/${billId}`)
    if (response.status === 200) {
      bills.value = bills.value.filter(bill => bill._id !== billId)
      showDeleteItems.value.delete(billId)
    }
  } catch (error) {
    console.error('Error deleting bill:', error)
  }
}

const totalBalance = computed(() => {
  return bills.value.reduce((total, bill) => {
    return total + (bill.type === 'income' ? bill.amount : -bill.amount)
  }, 0)
})

const husbandExpense = computed(() => {
  return bills.value
    .filter(bill => bill.role === 'husband' && bill.type === 'expense')
    .reduce((total, bill) => total + bill.amount, 0)
})

const wifeExpense = computed(() => {
  return bills.value
    .filter(bill => bill.role === 'wife' && bill.type === 'expense')
    .reduce((total, bill) => total + bill.amount, 0)
})

const groupedBills = computed(() => {
  const groups = {}
  bills.value.forEach(bill => {
    const date = new Date(bill.date).toLocaleDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(bill)
  })
  return groups
})

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }).format(date)
}

const getCategoryIcon = (category) => {
  const icons = {
    '餐饮': 'fa-utensils',
    '交通': 'fa-car',
    '购物': 'fa-shopping-bag',
    '娱乐': 'fa-gamepad',
    '居住': 'fa-home',
    '医疗': 'fa-hospital',
    '教育': 'fa-graduation-cap',
    '工资': 'fa-money-bill-wave',
    '奖金': 'fa-gift',
    '投资': 'fa-chart-line',
    '兼职': 'fa-briefcase',
    '其他': 'fa-ellipsis-h'
  }
  return icons[category] || 'fa-tag'
}

const fetchBills = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/bills')
    bills.value = response.data
    console.log(bills.value)

  } catch (error) {
    console.error('Error fetching bills:', error)
  }
}

onMounted(() => {
  fetchBills()
})
</script>

<style scoped>
.home {
  min-height: 100vh;
  background-color: #000;
  color: #fff;
  padding-bottom: 70px;
}

.header {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  padding: 20px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header h1 {
  font-size: 28px;
  font-weight: 500;
  margin-bottom: 20px;
}

.balance-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.balance-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.balance-card.total {
  grid-column: 1 / -1;
  background: #2997ff;
}

.balance-card .label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.balance-card h2,
.balance-card h3 {
  font-size: 24px;
  margin: 5px 0;
  font-weight: 500;
  color: #fff;
}

.balance-card h2 {
  font-size: 32px;
}

.bill-list {
  padding: 20px;
}

.date-header {
  color: #86868b;
  font-size: 14px;
  margin: 20px 0 10px;
}

.bill-item-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  margin-bottom: 10px;
  touch-action: pan-x pan-y;
}

.bill-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(10px);
  transform: translateX(0);
  transition: transform 0.3s ease;
  position: relative;
  z-index: 1;
}

.bill-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.category-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.category-icon.expense {
  background: #ff375f;
}

.category-icon.income {
  background: #30d158;
}

.bill-details {
  display: flex;
  flex-direction: column;
}

.category {
  font-weight: 500;
  color: #fff;
}

.description {
  font-size: 14px;
  color: #86868b;
  margin-top: 4px;
}

.role-indicator {
  color: #2997ff;
  font-size: 18px;
}

.amount {
  margin-right: 90px;
  font-weight: 500;
  color: #ff375f;
}

.amount.income {
  color: #30d158;
}

.delete-button {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 80px;
  background: #ff375f;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  border-radius: 0 12px 12px 0;
  z-index: 0;
}

.delete-button i {
  font-size: 20px;
  margin-bottom: 4px;
}

.bill-item-wrapper.show-delete .bill-item {
  transform: translateX(-80px);
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  display: flex;
  justify-content: space-around;
  padding: 10px;
}

.nav-item {
  text-decoration: none;
  color: #86868b;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  transition: color 0.3s ease;
}

.nav-item.active {
  color: #2997ff;
}

.add-button {
  background: #2997ff;
  width: 50px;
  height: 50px;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -25px;
  color: #fff;
  box-shadow: 0 4px 8px rgba(41, 151, 255, 0.4);
}

.add-button i {
  font-size: 20px;
}
</style> 