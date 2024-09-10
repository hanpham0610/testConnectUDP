<template>
    <div>
      <h1>UDP Message History</h1>
      <ul>
        <li v-for="(item, index) in messages" :key="index">
          <strong>IP:</strong> {{ item.ip }} <br>
          <strong>Data:</strong> {{ item.message }} <br>
          <strong>Time:</strong> {{ formattedTimestamp(item.timestamp) }}
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import { defineComponent, ref, onMounted } from 'vue';
  // eslint-disable-next-line no-unused-vars
  import { getDatabase, ref as dbRef, onValue } from 'firebase/database';
  import { database } from '@/js/firebaseConfig'; // Adjust path as needed
  
  export default defineComponent({
    setup() {
      const messages = ref([]);
  
      const fetchMessages = () => {
        const messagesRef = dbRef(database, 'messages'); // Path to your messages in Firebase
        onValue(messagesRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            messages.value = Object.values(data); // Convert object to array
          }
        }, {
          onlyOnce: true
        });
      };
  
      const formattedTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });
      };
  
      onMounted(() => {
        fetchMessages();
      });
  
      return { messages, formattedTimestamp };
    }
  });
  </script>
  
  <style>
  /* Add any styles you need here */
  </style>
  