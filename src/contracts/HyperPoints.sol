// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HyperPoints is ERC20, ERC20Burnable, Ownable {
    address public minter;

    event MinterUpdated(address indexed newMinter);

    constructor() ERC20("Hyper Points", "HP") {
        _transferOwnership(msg.sender);
    }

    modifier onlyMinter() {
        require(msg.sender == minter, "HyperPoints: caller is not the minter");
        _;
    }

    function setMinter(address _minter) external onlyOwner {
        require(_minter != address(0), "HyperPoints: zero address");
        minter = _minter;
        emit MinterUpdated(_minter);
    }

    function mint(address to, uint256 amount) external onlyMinter {
        _mint(to, amount);
    }
}
