// Script to download all Typeform images
const https = require('https');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'icons', 'form');

// All image URLs from the questions_order.md document
const images = [
  // Section 2 - Risk Binary
  { url: 'https://images.typeform.com/images/jHBPVdcEz5xc/choice/default', name: 'risk_q1_a.png' },
  { url: 'https://images.typeform.com/images/ccyJrNBNFqwk/choice/default', name: 'risk_q1_b.png' },
  { url: 'https://images.typeform.com/images/wf9fnDeDumpz/choice/default', name: 'risk_q2_a.png' },
  { url: 'https://images.typeform.com/images/qgPhCwx6572B/choice/default', name: 'risk_q2_b.png' },
  { url: 'https://images.typeform.com/images/yhcLgnuLc68W/choice/default', name: 'risk_q3_a.png' },
  { url: 'https://images.typeform.com/images/CixFzX9W494x/choice/default', name: 'risk_q3_b.png' },
  { url: 'https://images.typeform.com/images/s6gjHpzyddNf/choice/default', name: 'risk_q4_a.png' },
  { url: 'https://images.typeform.com/images/QYhKnkcSSxXX/choice/default', name: 'risk_q4_b.png' },
  { url: 'https://images.typeform.com/images/NtA6NuuHhikB/choice/default', name: 'risk_q5_a.png' },
  { url: 'https://images.typeform.com/images/i72jMkWqpsmz/choice/default', name: 'risk_q5_b.png' },

  // Section 3 - Reward Binary
  { url: 'https://images.typeform.com/images/6fUUZZVUwXcP/choice/default', name: 'reward_q1_a.png' },
  { url: 'https://images.typeform.com/images/ApGNnnh8G6Jw/choice/default', name: 'reward_q1_b.png' },
  { url: 'https://images.typeform.com/images/KahwZJ2McUga/choice/default', name: 'reward_q2_a.png' },
  { url: 'https://images.typeform.com/images/6k3idjhNrcRx/choice/default', name: 'reward_q2_b.png' },
  { url: 'https://images.typeform.com/images/VW6c8deBfpx6/choice/default', name: 'reward_q3_a.png' },
  { url: 'https://images.typeform.com/images/jnB4ZDsa2j3M/choice/default', name: 'reward_q3_b.png' },
  { url: 'https://images.typeform.com/images/9VG8kSSNNzED/choice/default', name: 'reward_q4_a.png' },
  { url: 'https://images.typeform.com/images/6ZCLqyP4CpCp/choice/default', name: 'reward_q4_b.png' },
  { url: 'https://images.typeform.com/images/3ebmQKYVwMXb/choice/default', name: 'reward_q5_a.png' },
  { url: 'https://images.typeform.com/images/pULwmsuaEZLw/choice/default', name: 'reward_q5_b.png' },

  // Section 4 - Big 5
  { url: 'https://images.typeform.com/images/A8yuNLyBQBFu/choice/default', name: 'big5_q1_a.png' },
  { url: 'https://images.typeform.com/images/cBTQLxBLGVT5/choice/default', name: 'big5_q1_b.png' },
  { url: 'https://images.typeform.com/images/nQbFePNmSGmS/choice/default', name: 'big5_q2_a.png' },
  { url: 'https://images.typeform.com/images/gVudrtWrLEgJ/choice/default', name: 'big5_q2_b.png' },
  { url: 'https://images.typeform.com/images/aj24r7jaYPES/choice/default', name: 'big5_q3_a.png' },
  { url: 'https://images.typeform.com/images/eWSNBqS976Ch/choice/default', name: 'big5_q3_b.png' },
  { url: 'https://images.typeform.com/images/fQVGhaX8PTvA/choice/default', name: 'big5_q4_a.png' },
  { url: 'https://images.typeform.com/images/eDbPXetZcMFn/choice/default', name: 'big5_q4_b.png' },
  { url: 'https://images.typeform.com/images/ZYnLN2XyqUeE/choice/default', name: 'big5_q5_a.png' },
  { url: 'https://images.typeform.com/images/3HfGAfu4Q938/choice/default', name: 'big5_q5_b.png' },

  // Section 5 - Four Types (10 questions x 4 options each = 40 images)
  // 5a
  { url: 'https://images.typeform.com/images/SqEKdDwsm99D/choice/default', name: 'type_q1_a.png' },
  { url: 'https://images.typeform.com/images/hY4aHPa4KXYM/choice/default', name: 'type_q1_b.png' },
  { url: 'https://images.typeform.com/images/UR7qz3mFVLke/choice/default', name: 'type_q1_c.png' },
  { url: 'https://images.typeform.com/images/kpPYY3YfnXnM/choice/default', name: 'type_q1_d.png' },
  // 5b
  { url: 'https://images.typeform.com/images/vAbiNc2Nw9CJ/choice/default', name: 'type_q2_a.png' },
  { url: 'https://images.typeform.com/images/QrYbXppSqRUi/choice/default', name: 'type_q2_b.png' },
  { url: 'https://images.typeform.com/images/eGnMFthg2Mmr/choice/default', name: 'type_q2_c.png' },
  { url: 'https://images.typeform.com/images/DaQ4vN4EGdhG/choice/default', name: 'type_q2_d.png' },
  // 5c
  { url: 'https://images.typeform.com/images/i5U3SnefuuRA/choice/default', name: 'type_q3_a.png' },
  { url: 'https://images.typeform.com/images/NCwhvVTW8d62/choice/default', name: 'type_q3_b.png' },
  { url: 'https://images.typeform.com/images/cmZ9ieMQ326p/choice/default', name: 'type_q3_c.png' },
  { url: 'https://images.typeform.com/images/293mGBY4mgFY/choice/default', name: 'type_q3_d.png' },
  // 5d
  { url: 'https://images.typeform.com/images/JEhxZhGZdsbG/choice/default', name: 'type_q4_a.png' },
  { url: 'https://images.typeform.com/images/nUhVchWTZEW6/choice/default', name: 'type_q4_b.png' },
  { url: 'https://images.typeform.com/images/NTadaPvmZ2px/choice/default', name: 'type_q4_c.png' },
  { url: 'https://images.typeform.com/images/7ii267YScXY8/choice/default', name: 'type_q4_d.png' },
  // 5e
  { url: 'https://images.typeform.com/images/n8uEF4EUjbtY/choice/default', name: 'type_q5_a.png' },
  { url: 'https://images.typeform.com/images/vgdp959MhB4q/choice/default', name: 'type_q5_b.png' },
  { url: 'https://images.typeform.com/images/7hxdnah6QzRC/choice/default', name: 'type_q5_c.png' },
  { url: 'https://images.typeform.com/images/mzd9sGtTdyKS/choice/default', name: 'type_q5_d.png' },
  // 5f
  { url: 'https://images.typeform.com/images/sHbdeU5k6VsJ/choice/default', name: 'type_q6_a.png' },
  { url: 'https://images.typeform.com/images/UL5KaX6JfHKX/choice/default', name: 'type_q6_b.png' },
  { url: 'https://images.typeform.com/images/SakbNWTHiWkK/choice/default', name: 'type_q6_c.png' },
  { url: 'https://images.typeform.com/images/uhbfR8xa2Tt3/choice/default', name: 'type_q6_d.png' },
  // 5g
  { url: 'https://images.typeform.com/images/sxvAPxWLmQKN/choice/default', name: 'type_q7_a.png' },
  { url: 'https://images.typeform.com/images/FvELriZT8Hr7/choice/default', name: 'type_q7_b.png' },
  { url: 'https://images.typeform.com/images/bqYzeJVdUKYM/choice/default', name: 'type_q7_c.png' },
  { url: 'https://images.typeform.com/images/zWrmLL48kPEr/choice/default', name: 'type_q7_d.png' },
  // 5h
  { url: 'https://images.typeform.com/images/nMbm86fXEUGy/choice/default', name: 'type_q8_a.png' },
  { url: 'https://images.typeform.com/images/YhLpNPhrTYiJ/choice/default', name: 'type_q8_b.png' },
  { url: 'https://images.typeform.com/images/UZGUFMVCydmz/choice/default', name: 'type_q8_c.png' },
  { url: 'https://images.typeform.com/images/Pnm2ErJJSgP6/choice/default', name: 'type_q8_d.png' },
  // 5i
  { url: 'https://images.typeform.com/images/NBZWqwQKAMM4/choice/default', name: 'type_q9_a.png' },
  { url: 'https://images.typeform.com/images/FL9BQA5v2UrY/choice/default', name: 'type_q9_b.png' },
  { url: 'https://images.typeform.com/images/hpVWWXdznGaU/choice/default', name: 'type_q9_c.png' },
  { url: 'https://images.typeform.com/images/GhQqnHv899Zn/choice/default', name: 'type_q9_d.png' },
  // 5j
  { url: 'https://images.typeform.com/images/KvAX4aZwFpHj/choice/default', name: 'type_q10_a.png' },
  { url: 'https://images.typeform.com/images/99vyijyM6mFe/choice/default', name: 'type_q10_b.png' },
  { url: 'https://images.typeform.com/images/RcFuKdAmTjEW/choice/default', name: 'type_q10_c.png' },
  { url: 'https://images.typeform.com/images/qHuNzKxBuGTv/choice/default', name: 'type_q10_d.png' },

  // Section 6 - Driver (6b)
  { url: 'https://images.typeform.com/images/gBQcaxN9nJu9/choice/default', name: 'driver_boss.png' },
  { url: 'https://images.typeform.com/images/27LL6tQhUiz2/choice/default', name: 'driver_control.png' },
  { url: 'https://images.typeform.com/images/AgWSqgwyDfVi/choice/default', name: 'driver_passion.png' },
  { url: 'https://images.typeform.com/images/AQEq7Hws77qe/choice/default', name: 'driver_money.png' },
  { url: 'https://images.typeform.com/images/WiJ4HGgiYUDv/choice/default', name: 'driver_solve.png' },
  { url: 'https://images.typeform.com/images/7NJYRNpy38jJ/choice/default', name: 'driver_impact.png' },
  { url: 'https://images.typeform.com/images/ZuqEf8VZqmVR/choice/default', name: 'driver_legacy.png' },

  // Section 7 - AOI (7a and 7b use same images)
  { url: 'https://images.typeform.com/images/KM6k6iy28sH3/choice/default', name: 'aoi_arts.png' },
  { url: 'https://images.typeform.com/images/AYuVVFv6AueY/choice/default', name: 'aoi_consulting.png' },
  { url: 'https://images.typeform.com/images/9iL46TRC29vN/choice/default', name: 'aoi_digital.png' },
  { url: 'https://images.typeform.com/images/7QDAZT7iTD7r/choice/default', name: 'aoi_education.png' },
  { url: 'https://images.typeform.com/images/W8YK2eaqZ7Em/choice/default', name: 'aoi_hospitality.png' },
  { url: 'https://images.typeform.com/images/pHGJb3QDf67M/choice/default', name: 'aoi_health.png' },
  { url: 'https://images.typeform.com/images/hDBr4WKfuYy9/choice/default', name: 'aoi_personal.png' },
  { url: 'https://images.typeform.com/images/FYz29Wq2C3aK/choice/default', name: 'aoi_retail.png' },
  { url: 'https://images.typeform.com/images/PJ4MfEfqJAH3/choice/default', name: 'aoi_social.png' },
  { url: 'https://images.typeform.com/images/S7SUbWjMW2TG/choice/default', name: 'aoi_tech.png' },
  { url: 'https://images.typeform.com/images/hZGbQJ7vNnQq/choice/default', name: 'aoi_trades.png' },

  // Section 9 - Strategy
  { url: 'https://images.typeform.com/images/N9m5knqM6u2L/choice/default', name: 'strategy_creator.png' },
  { url: 'https://images.typeform.com/images/mMdudeMBQzNx/choice/default', name: 'strategy_consolidator.png' },
  { url: 'https://images.typeform.com/images/rPEtUmTpQjpR/choice/default', name: 'strategy_franchisee.png' },
  { url: 'https://images.typeform.com/images/KT8YnAE57eJq/choice/default', name: 'strategy_contractor.png' },
];

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(OUTPUT_DIR, filename);

    // Check if already exists
    if (fs.existsSync(filePath)) {
      console.log(`✓ Already exists: ${filename}`);
      resolve();
      return;
    }

    const file = fs.createWriteStream(filePath);

    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        https.get(response.headers.location, (res) => {
          res.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log(`✓ Downloaded: ${filename}`);
            resolve();
          });
        }).on('error', reject);
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded: ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      console.error(`✗ Failed: ${filename} - ${err.message}`);
      reject(err);
    });
  });
}

async function downloadAll() {
  console.log(`Downloading ${images.length} images to ${OUTPUT_DIR}...\n`);

  // Download in batches of 5
  for (let i = 0; i < images.length; i += 5) {
    const batch = images.slice(i, i + 5);
    await Promise.all(batch.map(img => downloadImage(img.url, img.name).catch(() => {})));
  }

  console.log('\nDone!');
}

downloadAll();
