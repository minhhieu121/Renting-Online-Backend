const bcrypt = require('bcrypt');

const password = 'Abcd@1234';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    process.exit(1);
  }
  console.log('\n🔐 Password Hash Generated:\n');
  console.log(hash);
  console.log('\n📋 Copy this hash and replace all instances of:');
  console.log('$2b$10$rQNZJ9qvGJ5YQZJFqJ5ZJuQzJ9qvGJ5YQZJFqJ5ZJuQzJ9qvGJ5YQ');
  console.log('\nIn the file: be/db/seed_data.sql');
  process.exit(0);
});
