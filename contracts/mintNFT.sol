// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./hotelOwner.sol";
import "./userInteracts.sol";
contract HotelNFT is ERC721, Ownable, HotelRegistry, interactUsers{
    HotelRegistry obj1;
    struct HotelBooking {
        string hotelName;
        address hotelAddress;
        address userAddress;
        uint256 totalRoomsBooked;
        uint256 arrivalDate;
        uint256 exitDate;
        uint256[] rooms;
        bool hasUsed;
    }

    mapping(uint256 => HotelBooking) public hotelBookings;
    mapping(uint256 => bool) tokenIsActive;
    mapping(address => uint256[]) public addressToTokens;
    uint256 public tokenId =0;
    constructor() ERC721("OYO_2.0","OYO") {
    }

    function bookHotel (
        string memory _hotelName,
        address payable _hotelAddress,
        address _userAddress,
        uint256 _totalRoomsBooked,
        uint16 _arrivalYear,
        uint8 _arrivalMonth,
        uint8 _arrivalDay,
        uint16 _exitYear,
        uint8 _exitMonth,
        uint8 _exitDay
    )  public payable
     {
        // uint256 _arrivalDate = 0;
        //  uint256 _exitDate =0;
        uint256 _arrivalDate = 0; //convertToTimestamp(_arrivalYear, _arrivalMonth, _arrivalDay);
        uint256 _exitDate = 0; //convertToTimestamp(_exitYear, _exitMonth, _exitDay);
        require(msg.value >= (_totalRoomsBooked * hotelData[_hotelAddress].rate)/1 ether,"sending Less ether!");
        require(_totalRoomsBooked > 0, "Total rooms booked must be greater than zero");
        // require(_arrivalDate > block.timestamp, "Arrival date must be in the future");
        // require(_exitDate > _arrivalDate, "Exit date must be greater than arrival date");
        require(_totalRoomsBooked <= hotelData[_hotelAddress].roomsAvailable,"Insufficient rooms available");
        uint256[] memory _rooms;
        _hotelAddress.transfer(msg.value);
        tokenId = tokenId +1;
        hotelBookings[tokenId] = HotelBooking(
             _hotelName,
            _hotelAddress,
            _userAddress,
            _totalRoomsBooked,
            _arrivalDate,
            _exitDate,_rooms,
            false
        );

        hotelData[_hotelAddress].roomsAvailable = hotelData[_hotelAddress].roomsAvailable - _totalRoomsBooked;
        addressToTokens[msg.sender].push(tokenId);
        _safeMint(msg.sender, tokenId);
        
    }

    function getHotelDetails(uint256 _tokenId) external view returns (HotelBooking memory) {
    require(_exists(_tokenId), "Invalid token ID");

    return hotelBookings[_tokenId];
}

}

