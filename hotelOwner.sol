// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract HotelRegistry
{
    using SafeMath for uint256;

    //this var will store total ether in this smart contract
    uint256 public balance;
    //registration fee 
    uint256 registrationFee;
    address public _owner; 
    struct hotelMetaData{
        string name;
        string place;
        uint256 roomCount;
        uint256 rate;
        uint256 roomsAvailable;
    }
    //mapping to show which addresses are registered as HOTEL OWNERS 
    mapping(address=>bool) registeredHotels;
    mapping(address=> hotelMetaData)  hotelData;
    event HotelRegistrationDone(address hotelAddress, uint256 value);
    event feesUpdated(uint256 _fees);

    //onlyOwner modifier 
    modifier _onlyOwner()
    {
        require(msg.sender == _owner);
        _;
    }

    //constructor 
    constructor()
    {
        _owner = msg.sender;
        registrationFee = 1 ether;
    }

    //function to apply as a Hotel Owner: 
    function registerHotel() public payable {
        require(registeredHotels[msg.sender] == false,"You are already registered! Dont register again ser");
        require(msg.value >= registrationFee, "You Must have mentioned ether to register your Hotel");

        registeredHotels[msg.sender] = true;
        balance= balance +  msg.value;
        emit HotelRegistrationDone(msg.sender, msg.value);
    }

    //to set Registartion Fees 
    function setFees(uint256 _fees) public _onlyOwner() {
        require(_fees > 0 ether);
        registrationFee = _fees.mul(1 ether);
        emit feesUpdated(_fees);
    }
    
    //to check Fees 
    function checkFees() public view returns(uint256){
        return(registrationFee);
    }

    function addHotelDetails(string memory _hotelName, string memory  _place, uint256  _roomcount, uint256 _costPerRoom, uint256 _roomsAvailable) public{
        require(registeredHotels[msg.sender] == true, "Please first you need to register your Hotel!");

        //now set hotel meta data
        hotelData[msg.sender].name = _hotelName;
        hotelData[msg.sender].place = _place;
        hotelData[msg.sender].roomCount = _roomcount;
        hotelData[msg.sender].rate = _costPerRoom;
        hotelData[msg.sender].roomsAvailable = _roomsAvailable;
    }
    function withdrawRegistration() public {
        require(registeredHotels[msg.sender] == true, "Please first you need to register your Hotel!");
        address payable ownerAddress = payable(msg.sender);
        registeredHotels[msg.sender] = false;
        delete hotelData[msg.sender];
        ownerAddress.transfer(registrationFee.mul(50).div(100));
        balance = balance - registrationFee.mul(50).div(100);
        
    }   

}
