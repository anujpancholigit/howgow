// server.js
const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');
const Plan = require('./models/Plan');
const Purchase = require('./models/Purchase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

const monUri = 'mongodb+srv://anujstudybox:d4gpwGWp9YMsYDGJ@clusterzerogcp.amlw7gp.mongodb.net/?retryWrites=true&w=majority&appName=ClusterZeroGCP';

mongoose.connect(monUri);

app.use(express.json());


app.listen(3000, () => console.log('Server running on port 3000'));

// ...

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    username,
    password: hashedPassword,
  });

  await user.save();

  res.json({ message: 'User signed up successfully' });
});

//Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(400).json({ message: 'User does not exist' });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(400).json({ message: 'Incorrect password' });
  }

  const token = jwt.sign({ userId: user._id }, 'RamLakhanSitaHanuman', { expiresIn: '7d' });

  res.json({ message: 'User logged in successfully', token });
});
// server.js

// ...

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(403).json({ message: 'Authentication token required' });
  }

  try {
    const payload = jwt.verify(token, 'your-secret-key');

    req.user = await User.findById(payload.userId);

    next();
  } catch (e) {
    return res.status(403).json({ message: 'Invalid or expired authentication token' });
  }
};

app.get('/protected', authenticate, (req, res) => {
  // The user is available in req.user
  res.json({ message: 'This is a protected route' });
});

// API routes go here

// Adding dummy plans to the database
// server.js

// ...

app.post('/add-plans', async (req, res) => {
  const plans = [
    { 
      name: 'Basic', 
      price: 10, 
      features: ['feature1', 'feature2'], 
      description: 'This is a basic plan.', 
      duration: 'monthly', 
      isActive: true 
    },
    { 
      name: 'Premium', 
      price: 20, 
      features: ['feature1', 'feature2', 'feature3'], 
      description: 'This is a premium plan.', 
      duration: 'quarterly', 
      isActive: true 
    },
    { 
      name: 'Ultimate', 
      price: 30, 
      features: ['feature1', 'feature2', 'feature3', 'feature4'], 
      description: 'This is an ultimate plan.', 
      duration: 'yearly', 
      isActive: true 
    },
  ];

  for (let plan of plans) {
    const newPlan = new Plan(plan);
    await newPlan.save();
  }

  res.json({ message: 'Plans added successfully' });
});

// fetching all plans from the database

app.get('/plans', async (req, res) => {
  const plans = await Plan.find();
  res.json(plans);
});