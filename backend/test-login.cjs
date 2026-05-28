const axios = require('axios');
axios.post('http://localhost:5000/api/users/google-login', { name: 'Test', email: 'test@test.com', picture: 'none' })
  .then(res => console.log(res.data))
  .catch(err => console.error(err.response ? err.response.data : err.message));
