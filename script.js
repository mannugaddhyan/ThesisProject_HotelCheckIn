//let contractAbi = require('./abi');
// const Web3 = require('web3');
// const web3 = new Web3('http://localhost:8545');

// Set the provider URL
const providerUrl = 'https://sepolia.infura.io/v3/e4dfcdcf0e65459d885cf853250d4643';

// Create a new web3 instance with the custom provider
const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));

const contractAddress = '0xF7990bA9AC20dd035c7886AeAc299b8d868dD876'; 
let contract;
let accounts;
let currentuser;

const connectWallet = async() => {
  try {
	const web3 = new Web3(window.ethereum);
	accounts = await web3.eth.getAccounts();
    contract = new web3.eth.Contract(contractAbi, contractAddress);

    await window.ethereum.request({method: 'eth_requestAccounts'}).then((accounts) => {
		handleWalletConnected(accounts);
		localStorage.setItem('isWalletConnected', 'true');
	}).catch((err) => {
		displayAlert('danger', 'Error connecting wallet');
	});

	// const web3 = new Web3(window.e thereum);
	// accounts = await web3.eth.getAccounts();
    // contract = new web3.eth.Contract(contractAbi, contractAddress);
	currentuser = accounts[0];
  } catch (err) {
    console.log(err);
    // alert("Metamask not installed");
	displayAlert('danger', err.message.toString());
  } 
}

document.getElementById('connectButton').addEventListener('click', ()=> {
	connectWallet();
});
  
const handleWalletConnected = async(accounts) => {
	try {
		const walletAddress = accounts[0];
		console.log("Wallet connected, address:", walletAddress);
		updateUI(walletAddress)
	} catch (err) {
		console.log(err);
		displayAlert('danger', err.message.toString());
	}
}

const updateUI = (walletAddress) => {
	try {
		const walletBtn = document.getElementById('connectButton');
		walletBtn.textContent = walletAddress;
		walletBtn.disabled = true; 
		walletBtn.classList.add('connected');
	} catch (err) {
		console.log(err);
		displayAlert('danger', err.message.toString());
	}
}


function displayAlert(type, message) {
    const alertContainer = $('#alertContainer');
    const alert = $('<div class="alert alert-dismissible">')
      .addClass(`alert-${type}`)
      .html(message)
      .append('<button type="button" class="close" data-dismiss="alert">&times;</button>');
	

    alertContainer.empty().append(alert);
}

 // Function to check the fees
async function checkFeesFrontend() {
    try {
      // Call the checkFees function of the contract
      const fees = await contract.methods.checkFees().call();
  
      console.log('Fees:', fees);
      const etherValue = web3.utils.fromWei(fees, 'ether');
      // Update the HTML content to display the fees
    document.getElementById('fees').textContent = etherValue + 'ETH';
      // You can update your frontend UI here with the fees value
    } catch (error) {
      console.error('Error checking fees:', error);
    }
  }

document.getElementById('checkFee').addEventListener('click', ()=> {
	checkFeesFrontend();
});


// Handle the registerHotel button click event
document.getElementById('register').addEventListener('click', async () => {
    try {
       // accounts = await web3.eth.getAccounts();
       // currentuser = accounts[0];
      // Get the registration fee from the contract
      const registrationFee = await contract.methods.checkFees().call();
      const options = {
        from: currentuser,
        value: registrationFee,
        gasLimit: 300000
    };
    let tx = await contract.methods.registerHotel().send(options);
    // await tx.wait();
  
      console.log('Hotel registration successful!');
    } catch (error) {
      console.error('Hotel registration failed:', error);
    }
  });

  // Function to set registration fees
async function setFees() {
    try {
      // Get the input value from the form
      const feesInput = document.getElementById('nameInput').value;
      const fees = parseFloat(feesInput);
  
      // Convert the fees to wei
        const feesWei = web3.utils.toWei(fees.toString(), 'ether');
  
      // Call the setFees function in the contract
      const options = {
        from: currentuser,
        gasLimit: 300000
      };
      let tx = await contract.methods.setFees(feesWei).send(options);
      await tx.wait();
  
      console.log('Registration fees updated successfully!');
    } catch (error) {
      console.error('Failed to update registration fees:', error);
    }
  }
  
  // Handle the setFees button click event
  document.getElementById('setfees').addEventListener('click', setFees);
  

  //withdraw Reg function 
  async function withdrawReg(){
    try{
      const options = {
        from: currentuser,
        gasLimit: 300000
      };
      const result = await contract.methods.withdrawRegistration().send(options);
      console.log("Withdrawal successful:", result);
    }
    catch(error){
      console.error('Failed to withdraw your registration fees:', error);
    }
  }

  document.getElementById('withdrawRegistration').addEventListener('click',withdrawReg );

  // Function to handle form submission
async function handleSubmit(event) {
  event.preventDefault();
  
  const form = document.getElementById('addHotelForm');
  const hotelName = form.elements.hotelName.value;
  const place = form.elements.place.value;
  const roomCount = Number(form.elements.roomCount.value);
  costPerRoom = parseFloat(form.elements.costPerRoom.value);
  // Convert the fees to wei
  costPerRoom = web3.utils.toWei(costPerRoom.toString(), 'ether');
  const roomsAvailable = Number(form.elements.roomsAvailable.value);
  const options = {
    from: currentuser,
    gasLimit: 300000
  };

  try {
    const result = await contract.methods.addHotelDetails(hotelName, place, roomCount, costPerRoom, roomsAvailable).send(options);
    console.log("Hotel details added:", result);
  } catch (error) {
    console.error("Error adding hotel details:", error);
  }
}

// Attach the form submission handler
const form = document.getElementById('addHotelForm');
form.addEventListener('submit', handleSubmit);


// Function to display hotel list on webpage
function displayHotelList(hotels) {
  const hotelList = document.getElementById('hotelList');
  
  hotels.forEach(hotel => {
    const listItem = document.createElement('li');
    listItem.textContent = hotel;
    hotelList.appendChild(listItem);
  });
}

// Function to fetch and display the hotel list
async function fetchHotelList() {
  try {
    const result = await contract.methods.viewHotelList().call(); 
    console.log("Registered Hotels:", result);
    displayHotelList(result);
  } catch (error) {
    console.error("Error fetching hotel list:", error);
  }
}

document.getElementById('viewlist').addEventListener('click',fetchHotelList );

// Function to get specific hotel details
async function getSpecificHotelDetails() {
  try {
    const hotelAddress = document.getElementById('t2').value;
    const result = await contract.methods.getSpecificHotelDetails(hotelAddress).call();
    console.log("Hotel Details:", result);
    const temp = result.rate;
    const x =  web3.utils.fromWei(temp.toString(), 'ether');

    // Display the result on the webpage
    const resultElement = document.getElementById('result');
    resultElement.innerHTML = `
      <p>Name: ${result.name}</p>
      <p>Place: ${result.place}</p>
      <p>Room Count: ${result.roomCount}</p>
      <p>Rate: ${x} </p>
      <p>Rooms Available: ${result.roomsAvailable}</p>
    `;
    
  } catch (error) {
    console.error("Error getting hotel details:", error);
  }
}

document.getElementById('getHotelDetails').addEventListener('click',getSpecificHotelDetails );

  // Function to handle form submission
  async function handleSubmit2(event) {
    event.preventDefault();
    
    const form = document.getElementById('bookHotelForm');
    const hotelName = form.elements.hotelName.value;
    const hotelAddress = form.elements.hotelAddress.value;
    const userAddress = form.elements.userAddress.value;
    const roomsBooked = Number(form.elements.roomsBooked.value);
    const result = await contract.methods.getSpecificHotelDetails(hotelAddress).call();
    const amtToPay = roomsBooked * result.rate;
    const options = {
      from: currentuser,
      value: amtToPay,
      gasLimit: 300000
    };
  
    try {
      const result = await contract.methods.bookHotel(hotelName, hotelAddress, userAddress, roomsBooked,0,0,0,0,0,0).send(options);
      console.log("Room Booking Done:", result);
    } catch (error) {
      console.error("Error adding hotel details:", error);
    }
  }
  
  // Attach the form submission handler
  const form2 = document.getElementById('bookHotelForm');
  form2.addEventListener('submit', handleSubmit2);
  

  //function to get room details 
  // Function to get specific hotel details
async function getSpecificRoomDetails() {
  try {
    const tokenID = document.getElementById('tokenInput').value;
    const result = await contract.methods.getHotelDetails(tokenID).call();
    console.log("BOOKING Details:", result);

    // Display the result on the webpage
    const resultElement = document.getElementById('result2');
    resultElement.innerHTML = `
      <p>Hotel Name: ${result.hotelName}</p>
      <p>Hotel wallet Address: ${result.hotelAddress}</p>
      <p>Room Booked: ${result.totalRoomsBooked}</p>
    `;
    
  } catch (error) {
    console.error("Error getting room details:", error);
  }
}

document.getElementById('tokenDetails').addEventListener('click',getSpecificRoomDetails );

// Function to fetch and display the hotel list
async function fetchTokenList() {
  try {
    const _address = document.getElementById('inp4').value;
    const result = await contract.methods.getTokensByAddress(_address).call(); 
    console.log("All Tokens List:", result);
  } catch (error) {
    console.error("Error fetching Tokens list:", error);
  }
}

document.getElementById('tokensNumber').addEventListener('click',fetchTokenList );


// Function to handle form submission
async function handleSubmit3(event) {
  event.preventDefault();
  
  const form = document.getElementById('checkIn');
  const userAddress = form.elements.userAddress.value;
  const tID = Number(form.elements.tokenID.value);
  const options = {
    from: currentuser,
    gasLimit: 300000
  };

  try {
    const result = await contract.methods.checkIn(tID,userAddress).send(options);
    console.log("Room Check In Done:", result);
  } catch (error) {
    console.error("Error while checking In:", error);
  }
}

// Attach the form submission handler
const form3 = document.getElementById('checkIn');
form3.addEventListener('submit', handleSubmit3);



// Function to handle form submission
async function handleSubmit4(event) {
  event.preventDefault();
  
  const form = document.getElementById('checkOut');
  const tID = Number(form.elements.tokenID2.value);
  const options = {
    from: currentuser,
    gasLimit: 300000
  };

  try {
    const result = await contract.methods.checkOut(tID).send(options);
    console.log("Room Check Out Done:", result);
  } catch (error) {
    console.error("Error while checking Out:", error);
  }
}

// Attach the form submission handler
const form4 = document.getElementById('checkOut');
form4.addEventListener('submit', handleSubmit4);
