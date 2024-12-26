const puppeteer = require("puppeteer");
const baseUrl = "https://www.myfxbook.com/members/Largueta/copy-trading/11101781"; // Cambia por la URL base de la tabla
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({ headless: false }); // Cambia a true cuando todo funcione bien
  const page = await browser.newPage();

  try {
    console.log('Abriendo la página...');
    await page.goto(baseUrl, { waitUntil: 'networkidle0', timeout: 0 });

    console.log('Buscando el botón para cerrar el modal...');
    const closeButtonSelector = 'button[data-dismiss="modal"]';

    await page.evaluate(() => {
      const button = document.querySelector('button[data-dismiss="modal"]');
      if (button) {
        button.click();
      } else {
        console.error('Botón no encontrado');
      }
    });

    // Esperar a que aparezca el botón del modal
    await page.waitForSelector(closeButtonSelector, { timeout: 1000 });
    console.log('Botón detectado. Cerrando el modal...');
    await page.click(closeButtonSelector);

    console.log('Modal cerrado. Esperando a que se cargue la pestaña de History...');
    // Hacer clic en el enlace "History"
    const historyTabSelector = 'a[href="#historyCont"][name="history"]';
    await page.waitForSelector(historyTabSelector, { timeout: 2000 });
    console.log('Pestaña History detectada. Haciendo clic...');
    await page.click(historyTabSelector);

    // Esperar a que la tabla de historial se cargue
    await page.waitForSelector('#historyCont table tbody tr', { timeout: 3000 });

    console.log('Iniciando scraping...');
    const rows = await page.$$eval('#historyCont table tbody tr', rows =>
      rows.map(row => {
        const cells = row.querySelectorAll('td');
        return Array.from(cells).map(cell => cell.textContent.trim());
      })
    );

    console.log('Datos scrapeados:', rows);

    // Opcional: Guardar los datos en un archivo JSON
    fs.writeFileSync('scrapedData.json', JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error('Error durante el scraping:', error);
  } finally {
    await browser.close();
  }
})();
