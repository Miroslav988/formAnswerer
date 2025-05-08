<template>
  <div class="form-container">
    <p class="site-description">
      Этот сайт позволяет рассчитать стоимость и отправить заявку на
      автоматические ответы для Google Форм.
    </p>
    <form @submit.prevent="handleSubmit" class="form-request">
      <label for="formUrl">Ссылка на Google Форму *</label>
      <input
        id="formUrl"
        v-model="formUrl"
        type="url"
        placeholder="https://docs.google.com/forms/..."
        required
        pattern="https://docs.google.com/forms/.*"
      />

      <label for="telegramContact">Ваш контакт в Telegram *</label>
      <input
        id="telegramContact"
        v-model="telegramContact"
        type="text"
        placeholder="@username или номер телефона"
        required
      />

      <label for="answerCount">Количество ответов *</label>
      <input
        id="answerCount"
        v-model.number="answerCount"
        type="number"
        min="1"
        required
      />

      <label for="comment">Комментарий (необязательно)</label>
      <textarea
        id="comment"
        v-model="comment"
        placeholder="Ваш комментарий"
        rows="3"
      ></textarea>

      <button
        type="button"
        @click="calculateCost"
        :disabled="loading || costLoading"
      >
        <span v-if="costLoading">Расчет...</span>
        <span v-else>Рассчитать стоимость</span>
      </button>

      <div v-if="approximateCost !== null" class="cost-display">
        <p>Примерная стоимость: {{ approximateCost }} руб.</p>
        <p v-if="approximateCostMessage">{{ approximateCostMessage }}</p>
      </div>

      <button v-if="approximateCost !== null" type="submit" :disabled="loading">
        {{ loading ? "Отправка..." : "Отправить заявку" }}
      </button>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
    </form>
  </div>
</template>

<script>
export default {
  name: "FormRequest",
  data() {
    return {
      formUrl: "",
      telegramContact: "",
      answerCount: 1,
      comment: "",
      loading: false,
      costLoading: false,
      errorMessage: "",
      successMessage: "",
      approximateCost: null,
      approximateCostMessage: "",
    };
  },
  methods: {
    async calculateCost() {
      this.approximateCost = null;
      this.approximateCostMessage = "";
      if (
        !this.formUrl.startsWith("https://docs.google.com/forms/") ||
        this.answerCount < 1
      ) {
        return;
      }
      this.costLoading = true;
      try {
        const response = await fetch("/api/calculate-cost", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            formUrl: this.formUrl,
            answerCount: this.answerCount,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          this.approximateCost = data.approximateCost;
          this.approximateCostMessage = data.approximateCostMessage || "";
        }
      } catch (error) {
        // ignore errors in cost calculation
      } finally {
        this.costLoading = false;
      }
    },
    async handleSubmit() {
      this.errorMessage = "";
      this.successMessage = "";
      if (!this.formUrl.startsWith("https://docs.google.com/forms/")) {
        this.errorMessage =
          "Ссылка должна начинаться с https://docs.google.com/forms/";
        return;
      }
      if (this.answerCount < 1) {
        this.errorMessage = "Количество ответов должно быть не меньше 1";
        return;
      }
      this.loading = true;
      try {
        // Отправка данных на backend API
        const response = await fetch(
          "http://localhost:8080/api/submit-request",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              formUrl: this.formUrl,
              telegramContact: this.telegramContact,
              answerCount: this.answerCount,
              comment: this.comment,
            }),
          }
        );
        const data = await response.json();
        if (response.ok) {
          this.successMessage = "Заявка успешно отправлена!";
          if (data.approximateCostMessage) {
            this.successMessage += " " + data.approximateCostMessage;
          }
          this.formUrl = "";
          this.telegramContact = "";
          this.answerCount = 1;
          this.comment = "";
          this.approximateCost = null;
          this.approximateCostMessage = "";
        } else {
          this.errorMessage = data.message || "Ошибка при отправке заявки";
        }
      } catch (error) {
        this.errorMessage = "Ошибка сети: " + error.message;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.form-request {
  display: flex;
  flex-direction: column;
}

label {
  margin-top: 15px;
  margin-bottom: 5px;
  font-weight: bold;
  color: white;
}

input,
textarea {
  padding: 8px;
  border: 1px solid rgb(103, 58, 183);
  border-radius: 4px;
  background-color: black;
  color: white;
  font-size: 14px;
}

input::placeholder,
textarea::placeholder {
  color: #ccc;
}

button {
  margin-top: 20px;
  padding: 10px;
  background-color: rgb(103, 58, 183);
  border: none;
  border-radius: 4px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

button:disabled {
  background-color: #6b4dbb;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: rgb(85, 48, 150);
}

.error-message {
  margin-top: 10px;
  color: #ff6b6b;
}

.success-message {
  margin-top: 10px;
  color: #6bff6b;
}
</style>
