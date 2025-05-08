const express = require('express');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const pixelmatch = require('pixelmatch');
const { PNG } = require('pngjs');

const app = express();
app.use(express.json());

const CAPTURE_PATH = path.join(__dirname, 'captures');
const TARGET_IMAGE = path.join(CAPTURE_PATH, 'last.png');

app.post('/check', async (req, res) => {
  const { url, selector } = req.body;

  if (!url || !selector) {
    return res.status(400).json({ error: 'url and selector required' });
  }

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0' });

  const element = await page.$(selector);
  const newPath = path.join(CAPTURE_PATH, `new.png`);
  await element.screenshot({ path: newPath });

  await browser.close();

  let changed = false;

  if (fs.existsSync(TARGET_IMAGE)) {
    const img1 = PNG.sync.read(fs.readFileSync(TARGET_IMAGE));
    const img2 = PNG.sync.read(fs.readFileSync(newPath));
    const diff = new PNG({ width: img1.width, height: img1.height });

    const diffPixels = pixelmatch(
      img1.data,
      img2.data,
      diff.data,
      img1.width,
      img1.height,
      { threshold: 0.1 }
    );

    if (diffPixels > 10) {
      changed = true;
    }
  } else {
    changed = true;
  }

  fs.copyFileSync(newPath, TARGET_IMAGE);

  return res.json({ change: changed });
});

app.listen(3000, () => {
  console.log('🧠 Puppeteer monitor running on port 3000');
});
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});


