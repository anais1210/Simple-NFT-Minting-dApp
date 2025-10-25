// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {MintNFT} from "../contracts/MintNFT.sol";
import { Test, console } from "forge-std/Test.sol";

contract MintNFTTest is Test {

    MintNFT instance;
    address owner;
    address user1;

    function setUp() public {
        owner = makeAddr("owner");
        user1 = makeAddr("user1");

        // Déployer le contrat avec l'owner
        instance = new MintNFT(owner);
    }

    function testOwner() public {
        assertEq(instance.owner(), owner);
    }

    function testSafeMint() public {
        string memory uri = "ipfs://CID1";

        // Prank owner
        vm.prank(owner);
        uint256 tokenId = instance.safeMint(owner, uri);

        assertEq(instance.tokenURI(tokenId), uri);
        assertEq(instance.ownerOf(tokenId), owner);

        console.log("TokenURI:", instance.tokenURI(tokenId));
    }

    function testMultipleMint() public {
        string memory uri1 = "ipfs://CID1";
        string memory uri2 = "ipfs://CID2";

        // User1 mint
        vm.prank(user1);
        uint256 tokenId1 = instance.safeMint(user1, uri1);
        assertEq(instance.tokenURI(tokenId1), uri1);
        assertEq(instance.ownerOf(tokenId1), user1);

        // Owner mint
        vm.prank(owner);
        uint256 tokenId2 = instance.safeMint(owner, uri2);
        assertEq(instance.tokenURI(tokenId2), uri2);
        assertEq(instance.ownerOf(tokenId2), owner);

        console.log("TokenIDs:", tokenId1, tokenId2);
    }
}
