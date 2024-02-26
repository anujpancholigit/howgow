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

const port = process.env.PORT || 3000; // Use the Cyclic port or fallback to 3000
app.listen(port, () => console.log(`Server running on port ${port}`));


// ...

app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  if(!password){
    return res.status(400).json({ message: 'Password is required for signup' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  if(!email || !username){
	return res.status(400).json({ message: 'Email and user name required' });
  }
  const user = new User({
    username,
	email,
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

  const token = jwt.sign({ userId: user._id }, 'RamLakhanSitaHanuman');
      const payload = jwt.verify(token, 'RamLakhanSitaHanuman');
	  console.log(payload);

  res.json({ message: 'User logged in successfully', token });
});
// server.js

// ...

const authenticate = async (req, res, next) => {
  let token = req.headers.authorization; // Get the token header
  if (!token) {
    return res.status(403).json({ message: 'Authentication token required' });
  }
  token = token.replace(/^Bearer\s+/, ""); // Remove the Bearer prefix and any whitespace

  if (!token) {
    return res.status(403).json({ message: 'Authentication token required' });
  }

  try {
    const payload = jwt.verify(token, 'RamLakhanSitaHanuman');

    req.user = await User.findById(payload.userId);
	console.log(req.uesr);
	req.isVerified = true;

    next();
  } catch (e) {
    return res.status(403).json({ message: 'Invalid or expired authentication token' + " " + e });
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

app.post('/add-plans', authenticate, async (req, res) => {
  const plansToAdd = [
    { 
      name: 'Basic', 
      price: 199, // Adjusted price for accuracy
      features: ['Responsive Design', 'Content Management System (CMS)'],
      description: 'Begin your online journey with essential features designed to establish your web presence.',
      duration: 'monthly', 
      isActive: true 
    },
    { 
      name: 'Premium', 
      price: 299, // Adjusted price for accuracy
      features: ['Responsive Design', 'Content Management System (CMS)', 'Search Engine Optimization (SEO)'],
      description: 'Elevate your website with advanced features tailored to enhance performance and visibility.',
      duration: 'quarterly', 
      isActive: true 
    },
    { 
      name: 'Ultimate', 
      price: 499, // Adjusted price for accuracy
      features: ['Responsive Design', 'Content Management System (CMS)', 'Search Engine Optimization (SEO)', 'Analytics and Reporting'],
      description: 'Unlock the full potential of your online presence with comprehensive features and priority support.',
      duration: 'yearly', 
      isActive: true 
    },
  ];
  try {
		for (let planData of plansToAdd) {
			let existingPlan = await Plan.findOne({ name: planData.name });
			if (!existingPlan) {
				const newPlan = new Plan(planData);
				await newPlan.save();
			} else {
				// Update existing plan data
				existingPlan.set(planData);
				await existingPlan.save();
			}
		}
    res.status(201).json({ message: 'Plans added successfully' }); // Use 201 Created status for resource creation
  } catch (error) {
    res.status(500).json({ error: 'Failed to add plans' });
  }
});



// fetching all plans from the database

app.get('/all-plans', authenticate, async (req, res) => {
  const { isVerified } = req;
  try {
    let plans;
    if (isVerified) {
      plans = await Plan.find();
    } else {
      plans = await Plan.find().select('name features').lean().exec(); // Only fetch name and features
      plans.forEach(plan => {
        plan.price = "Please log in to view prices."; // Modify price for non-verified users
      });
    }
    res.json(plans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }


  //purchasing a plan 

  app.post('/purchase/:planId',authenticate,async (req, res) => {
  try {
    // Extract the plan ID from the request parameters
    const planId = req.params.planId;

    // Find the plan in the database
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Create a new purchase document
    const purchase = new Purchase({
      user: req.user._id, // Assuming user is authenticated and user ID is available in the request
      plan: planId,
      purchaseDate: new Date()
    });

    // Save the purchase document to the database
    await purchase.save();

    // Return a success response
    res.status(201).json({ message: 'Plan purchased successfully', purchase: purchase });
  } catch (error) {
    console.error(error);
    // Return an error response
    res.status(500).json({ error: 'Failed to purchase plan' });
  }
});

app.get('/', async (req, res) => { 
	res.json('Ram ram ji Pland me Aapka Swagat Hai');
})

//purchase history for logged in user 

app.get('/purchases',authenticate, async (req, res) => {
  try {
    // Find all purchases associated with the authenticated user
    const purchases = await Purchase.find({ user: req.user._id })
                                     .populate('plan')
                                     .exec();

    // If no purchases found, return an empty array
    if (!purchases || purchases.length === 0) {
      return res.json({ message: 'No purchases found for this user' });
    }
	 // Format timestamps to Indian Standard Time (IST)
    const purchasesIST = purchases.map(purchase => {
      return {
        ...purchase._doc,
        purchaseDate: new Date(purchase.purchaseDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      };
    });

    // Return the list of purchases with formatted timestamps
    res.json({ purchases: purchasesIST });

  } catch (error) {
    console.error(error);
    // Return an error response
    res.status(500).json({ error: 'Failed to fetch user purchases' });
  }
});


});