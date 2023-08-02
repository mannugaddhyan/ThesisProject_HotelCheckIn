// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./mintNFT.sol";
contract verifyCredentials is HotelNFT{

    function checkIn(uint256 _tokenId, address _userAddress) public returns(uint256[] memory){
        require( ownerOf(_tokenId) == _userAddress, "You are not the Booker of this Room!");
        require(tokenIsActive[_tokenId] == false, "Token is already Active");
        require(hotelBookings[_tokenId].hotelAddress == msg.sender, "You are the wrong hotel Mate!");
        require(hotelBookings[_tokenId].hasUsed == false, "You have already used this token!");
        //Needs to assign rooms based on token data
        tokenIsActive[_tokenId] = true;         //now token Is active. 

        //Now we need to assign rooms to the user based on the number of rooms booked.
        uint256 _bookedRoomCount = hotelBookings[_tokenId].totalRoomsBooked;
        uint256 _totalRooms = hotelData[msg.sender].roomCount; 

        uint256[] memory changedIndexes = new uint256[](_bookedRoomCount);
        uint256 count = 0;
        for (uint256 i = 0; i < _totalRooms; i++) {
            if (hotelData[msg.sender].rooms[i] == 0) {
                hotelData[msg.sender].rooms[i] = 1;
                changedIndexes[count] = i;
                count++;

                if (count == _bookedRoomCount) {
                    break;
                }
            }
        }
        hotelBookings[_tokenId].rooms = changedIndexes;
        return changedIndexes;
    }
    function checkOut(uint256 _tokenId) public 
    {
        //check owner of NFT token.
        require( ownerOf(_tokenId) == msg.sender, "You are not the Booker of this Room!");
        require(tokenIsActive[_tokenId], "Token is already inactive");

        //now increment the room count 
        address hotelOwnerAddress1 = hotelBookings[_tokenId].hotelAddress;
        hotelData[hotelOwnerAddress1].roomsAvailable+=  hotelBookings[_tokenId].totalRoomsBooked; 

        //Now user should transfer/deactivate his/her nft to null address so it cant be used again. 
        tokenIsActive[_tokenId] = false;
        hotelBookings[_tokenId].hasUsed = true;
        // Remove token from the owner's ownership
        uint256[] storage ownerTokens = addressToTokens[msg.sender];
        for (uint256 i = 0; i < ownerTokens.length; i++) {
            if (ownerTokens[i] == _tokenId) {
                ownerTokens[i] = ownerTokens[ownerTokens.length - 1];
                ownerTokens.pop();
                break;
            }
        }

        //change all the rooms back to available which have been vacated. 
        for (uint256 i = 0; i < hotelBookings[_tokenId].rooms.length; i++) {
            uint256 index = hotelBookings[_tokenId].rooms[i];

            hotelData[hotelOwnerAddress1].rooms[index] = 0;
        }
    }

    function getTokensByAddress(address owner) public view returns (uint256[] memory) {
        return addressToTokens[owner];
    }


}

