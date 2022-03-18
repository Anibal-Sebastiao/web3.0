//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

contract Transactions {

    uint256 transactionsCount;

    event Transfer (address from, address recever, uint amount, string message, uint256 timestamp, string keyword);

    struct TransferStruct {
        address sender;
        address recever;
        uint amount;
        string message;
        uint256 timestamp;
        string keyword;
    }

    TransferStruct[] transactions;

    function addToBlockchain(address payable recever, uint amount, string memory message, string memory keyword) public {
        transactionsCount += 1;
        transactions.push(TransferStruct(msg.sender, recever, amount, message, block.timestamp, keyword));
        emit Transfer(msg.sender, recever, amount, message, block.timestamp, keyword);
    }

    function getAllTransactions() public view returns (TransferStruct[] memory) {
        return transactions;
    }

    function TansactionsCount() public view returns (uint256){
        return transactionsCount;
    }

}