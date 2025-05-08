import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { parseGoogleForm } from "./puppeteerHelper.js";
import { sendTelegramMessage } from "./telegramBot.js";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

app.post("/api/submit-request", async (req, res) => {
  const { formUrl, telegramContact, answerCount, comment } = req.body;

  if (!formUrl || !formUrl.startsWith("https://docs.google.com/forms/")) {
    return res.status(400).json({ message: "Неверный URL формы" });
  }
  if (!telegramContact) {
    return res.status(400).json({ message: "Не указан контакт в Telegram" });
  }
  if (!answerCount || answerCount < 1) {
    return res.status(400).json({ message: "Неверное количество ответов" });
  }

  try {
    // Парсим форму
    const formDetails = await parseGoogleForm(formUrl);

    // Проверяем наличие обязательных открытых вопросов без вариантов ответов
    const hasRequiredOpenQuestions = formDetails.questions.some(
      (q) =>
        q.type === "open" &&
        q.required &&
        (!q.options || q.options.length === 0)
    );

    let approximateCostMessage = "";
    if (hasRequiredOpenQuestions) {
      approximateCostMessage =
        "Внимание: в форме есть обязательные открытые вопросы, стоимость может измениться.";
    }

    // Формируем сообщение для Telegram с количеством вопросов по типам
    const counts = formDetails.questions.reduce((acc, q) => {
      if (q.type === "open") {
        if (q.required) {
          acc.open = (acc.open || 0) + 1;
        }
      } else {
        acc[q.type] = (acc[q.type] || 0) + 1;
      }
      return acc;
    }, {});

    // Расчет стоимости за один ответ
    const costPerAnswer =
      (counts.matrix || 0) * 0.2 +
      (counts.radio || 0) * 0.1 +
      (counts.checkbox || 0) * 0.15;

    // Общая стоимость
    const totalCost = costPerAnswer * answerCount;

    const message = `
Новая заявка на автоматические ответы:
Форма: ${formUrl}
Контакт в Telegram: ${telegramContact}
Количество ответов: ${answerCount}
Комментарий: ${comment || "-"}
Количество вопросов по типам:
- Матрица: ${counts.matrix || 0}
- Радио кнопки: ${counts.radio || 0}
- Чекбоксы: ${counts.checkbox || 0}
- Обязательные открытые вопросы: ${counts.open || 0}
Примерная стоимость: ${totalCost.toFixed(2)} руб.
${approximateCostMessage}
    `;

    // Отправляем сообщение в Telegram
    await sendTelegramMessage(message);

    res.json({
      message: "Заявка успешно отправлена",
      approximateCost: totalCost.toFixed(2),
      approximateCostMessage,
    });
  } catch (error) {
    console.error("Ошибка при обработке заявки:", error);
    res.status(500).json({ message: "Ошибка сервера при обработке заявки" });
  }
});

app.post("/api/calculate-cost", async (req, res) => {
  const { formUrl, answerCount } = req.body;

  if (!formUrl || !formUrl.startsWith("https://docs.google.com/forms/")) {
    return res.status(400).json({ message: "Неверный URL формы" });
  }
  if (!answerCount || answerCount < 1) {
    return res.status(400).json({ message: "Неверное количество ответов" });
  }

  try {
    // Парсим форму
    const formDetails = await parseGoogleForm(formUrl);

    // Проверяем наличие обязательных открытых вопросов без вариантов ответов
    const hasRequiredOpenQuestions = formDetails.questions.some(
      (q) =>
        q.type === "open" &&
        q.required &&
        (!q.options || q.options.length === 0)
    );

    let approximateCostMessage = "";
    if (hasRequiredOpenQuestions) {
      approximateCostMessage =
        "Внимание: в форме есть обязательные открытые вопросы, стоимость может измениться.";
    }

    // Формируем количество вопросов по типам
    const counts = formDetails.questions.reduce((acc, q) => {
      if (q.type === "open") {
        if (q.required) {
          acc.open = (acc.open || 0) + 1;
        }
      } else {
        acc[q.type] = (acc[q.type] || 0) + 1;
      }
      return acc;
    }, {});

    // Расчет стоимости за один ответ
    const costPerAnswer =
      (counts.matrix || 0) * 0.2 +
      (counts.radio || 0) * 0.1 +
      (counts.checkbox || 0) * 0.15;

    // Общая стоимость
    const totalCost = costPerAnswer * answerCount;

    res.json({
      approximateCost: totalCost.toFixed(2),
      approximateCostMessage,
    });
  } catch (error) {
    console.error("Ошибка при расчете стоимости:", error);
    res.status(500).json({ message: "Ошибка сервера при расчете стоимости" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
