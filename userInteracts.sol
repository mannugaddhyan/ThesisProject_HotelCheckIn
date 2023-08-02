// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./hotelOwner.sol"; 
contract interactUsers is HotelRegistry
{

    //function to see lists of all hotel owners 
    function viewHotelList() public view returns(address[] memory)
    {
        return registeredHotelsArray;
    }
    //function to see detials of a particular hotel 
    function getSpecificHotelDetails(address _hotel) public view returns(hotelMetaData memory){
        return(hotelData[_hotel]);
    }
}