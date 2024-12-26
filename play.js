const { chromium } = require("playwright");
const fs = require("fs");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Navegar a la página
  await page.goto('https://www.myfxbook.com/members/Largueta/copy-trading/11101781');
  
  // Esperar y cerrar el modal si aparece
  await page.waitForSelector('#popupAdContainer > div > div > div.continue-text > button');
  await page.click('#popupAdContainer > div > div > div.continue-text > button');
  console.log("Modal cerrado");

  // Esperar a que el tab 'History' esté visible y hacer clic en él para activar la tabla
  await page.waitForSelector('#tabHistory > a');
  await page.click('#tabHistory > a');
  console.log("Tab History seleccionado");
  

  // Esperar a que el tab tenga la clase 'active' para garantizar que se haya renderizado el contenido
  await page.waitForSelector('#tabHistory.active');
  console.log("Tab History activo");

  // Esperar a que el contenedor de la pestaña History sea visible
  await page.waitForSelector('#historyCont');

  // Esperar 2 segundos para que la tabla tenga tiempo de renderizarse
  await page.waitForTimeout(2000);
  console.log("Espera de 2 segundos completada");

  // Obtener los datos de la tabla de historial
  const datos = await page.$$eval(
    '#historyCont table tbody tr', // Seleccionamos las filas dentro de la tabla de historial
    (rows) => {
      return rows.map((row) => {
        const cells = row.querySelectorAll('td'); // Seleccionamos las celdas de cada fila
        console.log(cells);
        
        return {
          openDate: cells[0]?.innerText.trim(),  // Fecha de apertura
          closeDate: cells[2]?.innerText.trim(), // Fecha de cierre
          symbol: cells[4]?.innerText.trim(),    // Símbolo
          action: cells[5]?.innerText.trim(),    // Acción (Compra/Venta)
          lots: cells[6]?.innerText.trim(),      // Lotes
          openPrice: cells[7]?.innerText.trim(), // Precio de apertura
          closePrice: cells[8]?.innerText.trim(),// Precio de cierre
          pips: cells[9]?.innerText.trim(),      // Pips
          profit: cells[10]?.innerText.trim(),    // Ganancia (en USD)
          duration: cells[11]?.innerText.trim(),  // Duración
          gain: cells[12]?.innerText.trim()      // Ganancia porcentual
        };
      });
    }
  );

  console.log(datos); // Mostrar los datos extraídos

  // Guardar los datos en un archivo JSON
  fs.writeFileSync('scrapedData.json', JSON.stringify(datos, null, 2));

  // Cerrar el navegador (opcional, puedes dejarlo abierto para inspeccionar)
  await browser.close();
})();
