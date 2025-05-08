// import puppeteer from "puppeteer";

// function getRandomInt(max) {
//   return Math.floor(Math.random() * max);
// }

// function shuffleArray(array) {
//   for (let i = array.length - 1; i > 0; i--) {
//     const j = getRandomInt(i + 1);
//     [array[i], array[j]] = [array[j], array[i]];
//   }
//   return array;
// }

// async function safeClick(element) {
//   try {
//     // Check if element is visible and enabled before clicking
//     const box = await element.boundingBox();
//     if (box) {
//       // Small delay before clicking to improve stability
//       await new Promise((resolve) => setTimeout(resolve, 100));
//       await element.click();
//       return true;
//     } else {
//       console.log("Element not visible for clicking");
//       return false;
//     }
//   } catch (error) {
//     console.log("Error during click:", error.message);
//     return false;
//   }
// }

// (async () => {
//   for (let i = 0; i < 100; i++) {
//     const browser = await puppeteer.launch({ headless: false });
//     const page = await browser.newPage();

//     const formUrl =
//       "https://docs.google.com/forms/d/e/1FAIpQLSdD9IezB-EcglpE8Cg1FP7JSYTzHUmHMP1VGCkgYnj0MSuU4A/viewform";
//     // Retry logic for navigation
//     const maxRetries = 3;
//     let attempt = 0;
//     while (attempt < maxRetries) {
//       try {
//         await page.goto(formUrl, { waitUntil: "networkidle2" });
//         break; // success
//       } catch (error) {
//         console.log(
//           `Navigation attempt ${attempt + 1} failed: ${error.message}`
//         );
//         attempt++;
//         if (attempt === maxRetries) {
//           throw error;
//         }
//         await new Promise((resolve) => setTimeout(resolve, 3000)); // wait 3 seconds before retry
//       }
//     }

//     // Wait for the form to load
//     await page.waitForSelector('div[role="listitem"]');

//     // Get all questions containers
//     const questions = await page.$$('div[role="listitem"] > div');

//     for (const question of questions) {
//       // Check if question is a matrix (grid) question
//       const matrixRows = await question.$$('div[role="radiogroup"]');
//       if (matrixRows.length > 1) {
//         // For each row, select one random radio button excluding "другое"
//         for (const row of matrixRows) {
//           const radios = await row.$$('div[role="radio"]');
//           if (radios.length > 0) {
//             // If more than 3 radios, exclude the last one
//             const radiosToSelect =
//               radios.length > 3 ? radios.slice(0, -1) : radios;
//             const filteredRadios = [];
//             for (const radio of radiosToSelect) {
//               // Exclude radios that contain input elements inside
//               const hasInput = await radio.evaluate(
//                 (node) => node.querySelector("input") !== null
//               );
//               if (!hasInput) {
//                 filteredRadios.push(radio);
//               }
//             }
//             if (filteredRadios.length > 0) {
//               const randomIndex = getRandomInt(filteredRadios.length);
//               await safeClick(filteredRadios[randomIndex]);
//             }
//           }
//         }
//         continue;
//       }

//       // Check if question has radio buttons
//       const radios = await question.$$('div[role="radio"]');
//       if (radios.length > 0) {
//         // If more than 3 radios, exclude the last one
//         const radiosToSelect = radios.length > 5 ? radios.slice(0, -1) : radios;
//         const filteredRadios = [];
//         for (const radio of radiosToSelect) {
//           // Exclude radios that contain input elements inside
//           const hasInput = await radio.evaluate(
//             (node) => node.querySelector("input") !== null
//           );
//           if (!hasInput) {
//             filteredRadios.push(radio);
//           }
//         }
//         if (filteredRadios.length > 0) {
//           const randomIndex = getRandomInt(filteredRadios.length);
//           await safeClick(filteredRadios[randomIndex]);
//         }
//         continue;
//       }

//       // Check if question has checkboxes
//       const checkboxes = await question.$$('div[role="checkbox"]');
//       if (checkboxes.length > 0) {
//         // Select checkboxes excluding the last one (assumed to be "อื่นๆ")
//         const checkboxesToSelect = checkboxes.slice(0, -1);
//         if (checkboxesToSelect.length > 0) {
//           const shuffled = shuffleArray(checkboxesToSelect);
//           const maxCount = Math.min(3, checkboxesToSelect.length);
//           const count = getRandomInt(maxCount) + 1; // random between 1 and maxCount
//           console.log(
//             `Selecting ${count} checkboxes out of ${checkboxesToSelect.length}`
//           );
//           for (let i = 0; i < count; i++) {
//             await safeClick(shuffled[i]);
//           }
//         }
//         continue;
//       }
//     }

//     // Optionally submit the form
//     const submitButton = await page.$(
//       'div[role="button"][aria-label="Submit"]'
//     );
//     if (submitButton) {
//       await safeClick(submitButton);
//     }
//     console.log("Form submitted");
//     await new Promise((resolve) => setTimeout(resolve, 2000)); //
//     await browser.close();
//     // console.log(`Iteration ${i + 1} completed`);
//   }
// })();
// // background-color: rgb(103, 58, 183);
