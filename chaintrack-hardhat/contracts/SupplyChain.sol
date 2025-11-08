// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
contract SupplyChain {
    
    // State variables
    address public owner;
    uint256 public productCounter;
    uint256 public shipmentCounter;
    
    // Enums
    enum Role { None, Manufacturer, Distributor, Retailer, Customer }
    enum ProductStatus { Created, InTransit, Delivered, Verified, Disputed }
    enum ShipmentStatus { Pending, InTransit, Delivered, Delayed }
    
    // Structs
    struct User {
        address userAddress;
        string name;
        string email;
        Role role;
        bool isActive;
        uint256 registeredAt;
    }
    
    struct Product {
        uint256 productId;
        string productName;
        string description;
        string category;
        uint256 manufacturingDate;
        address manufacturer;
        string batchNumber;
        uint256 quantity;
        ProductStatus status;
        bool isAuthentic;
        uint256 createdAt;
        string qrCodeHash;
        string[] imageHashes; // IPFS hashes for product images
    }
    
    struct Checkpoint {
        address handler;
        string location;
        uint256 timestamp;
        string remarks;
        ProductStatus status;
        int256 latitude;
        int256 longitude;
        uint256 temperature; // For sensitive products
        uint256 humidity;
    }
    
    struct Shipment {
        uint256 shipmentId;
        uint256 productId;
        address from;
        address to;
        uint256 departureTime;
        uint256 expectedArrival;
        uint256 actualArrival;
        ShipmentStatus status;
        string trackingNumber;
        string vehicleInfo;
        Checkpoint[] checkpoints;
    }
    
    // Mappings
    mapping(address => User) public users;
    mapping(uint256 => Product) public products;
    mapping(uint256 => Shipment) public shipments;
    mapping(uint256 => uint256[]) public productShipments; // productId => shipmentIds
    mapping(string => uint256) public qrCodeToProduct; // qrCodeHash => productId
    mapping(uint256 => address[]) public productOwnershipHistory; // productId => addresses
    mapping(address => uint256[]) public userProducts; // user => productIds

    event UserRegistered(address indexed userAddress, string name, Role role);
    event ProductCreated(uint256 indexed productId, string productName, address manufacturer);
    event ProductTransferred(uint256 indexed productId, address from, address to);
    event CheckpointAdded(uint256 indexed shipmentId, address handler, string location);
    event ShipmentCreated(uint256 indexed shipmentId, uint256 productId, address from, address to);
    event ShipmentStatusUpdated(uint256 indexed shipmentId, ShipmentStatus status);
    event ProductVerified(uint256 indexed productId, address verifier);
    event ProductDisputed(uint256 indexed productId, address disputedBy, string reason);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    modifier onlyRole(Role _role) {
        require(users[msg.sender].role == _role, "Unauthorized role");
        _;
    }
    
    modifier onlyActiveUser() {
        require(users[msg.sender].isActive, "User is not active");
        _;
    }
    
    modifier productExists(uint256 _productId) {
        require(_productId > 0 && _productId <= productCounter, "Product does not exist");
        _;
    }
    
    modifier shipmentExists(uint256 _shipmentId) {
        require(_shipmentId > 0 && _shipmentId <= shipmentCounter, "Shipment does not exist");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        productCounter = 0;
        shipmentCounter = 0;
    }
    
    // User Management Functions
    function registerUser(
        string memory _name,
        string memory _email,
        Role _role
    ) public {
        require(_role != Role.None, "Invalid role");
        require(users[msg.sender].userAddress == address(0), "User already registered");
        
        users[msg.sender] = User({
            userAddress: msg.sender,
            name: _name,
            email: _email,
            role: _role,
            isActive: true,
            registeredAt: block.timestamp
        });
        
        emit UserRegistered(msg.sender, _name, _role);
    }
    
    function updateUserStatus(address _userAddress, bool _isActive) public onlyOwner {
        require(users[_userAddress].userAddress != address(0), "User not found");
        users[_userAddress].isActive = _isActive;
    }
    
    function getUserInfo(address _userAddress) public view returns (User memory) {
        return users[_userAddress];
    }
    
    // Product Management Functions
    function createProduct(
        string memory _productName,
        string memory _description,
        string memory _category,
        string memory _batchNumber,
        uint256 _quantity,
        string memory _qrCodeHash,
        string[] memory _imageHashes
    ) public onlyRole(Role.Manufacturer) onlyActiveUser returns (uint256) {
        require(bytes(_productName).length > 0, "Product name required");
        require(_quantity > 0, "Quantity must be greater than 0");
        require(qrCodeToProduct[_qrCodeHash] == 0, "QR code already exists");
        
        productCounter++;
        
        products[productCounter] = Product({
            productId: productCounter,
            productName: _productName,
            description: _description,
            category: _category,
            manufacturingDate: block.timestamp,
            manufacturer: msg.sender,
            batchNumber: _batchNumber,
            quantity: _quantity,
            status: ProductStatus.Created,
            isAuthentic: true,
            createdAt: block.timestamp,
            qrCodeHash: _qrCodeHash,
            imageHashes: _imageHashes
        });
        
        qrCodeToProduct[_qrCodeHash] = productCounter;
        productOwnershipHistory[productCounter].push(msg.sender);
        userProducts[msg.sender].push(productCounter);
        
        emit ProductCreated(productCounter, _productName, msg.sender);
        
        return productCounter;
    }
    
    function getProduct(uint256 _productId) 
        public 
        view 
        productExists(_productId) 
        returns (Product memory) 
    {
        return products[_productId];
    }
    
    function verifyProductByQR(string memory _qrCodeHash) 
        public 
        view 
        returns (bool exists, uint256 productId, Product memory product) 
    {
        productId = qrCodeToProduct[_qrCodeHash];
        if (productId > 0) {
            return (true, productId, products[productId]);
        }
        return (false, 0, products[0]);
    }
    
    function markProductAsDisputed(uint256 _productId, string memory _reason) 
        public 
        productExists(_productId) 
        onlyActiveUser 
    {
        products[_productId].status = ProductStatus.Disputed;
        products[_productId].isAuthentic = false;
        
        emit ProductDisputed(_productId, msg.sender, _reason);
    }
    
    function verifyProduct(uint256 _productId) 
        public 
        productExists(_productId) 
        onlyActiveUser 
    {
        require(
            users[msg.sender].role == Role.Distributor || 
            users[msg.sender].role == Role.Retailer,
            "Only distributors or retailers can verify"
        );
        
        products[_productId].status = ProductStatus.Verified;
        
        emit ProductVerified(_productId, msg.sender);
    }
    
    // Shipment Management Functions
    function createShipment(
        uint256 _productId,
        address _to,
        uint256 _expectedArrival,
        string memory _trackingNumber,
        string memory _vehicleInfo
    ) 
        public 
        productExists(_productId) 
        onlyActiveUser 
        returns (uint256) 
    {
        require(_to != address(0), "Invalid recipient address");
        require(users[_to].isActive, "Recipient is not active");
        require(_expectedArrival > block.timestamp, "Invalid expected arrival time");
        
        shipmentCounter++;
        
        Shipment storage newShipment = shipments[shipmentCounter];
        newShipment.shipmentId = shipmentCounter;
        newShipment.productId = _productId;
        newShipment.from = msg.sender;
        newShipment.to = _to;
        newShipment.departureTime = block.timestamp;
        newShipment.expectedArrival = _expectedArrival;
        newShipment.actualArrival = 0;
        newShipment.status = ShipmentStatus.Pending;
        newShipment.trackingNumber = _trackingNumber;
        newShipment.vehicleInfo = _vehicleInfo;
        
        productShipments[_productId].push(shipmentCounter);
        products[_productId].status = ProductStatus.InTransit;
        
        emit ShipmentCreated(shipmentCounter, _productId, msg.sender, _to);
        
        return shipmentCounter;
    }
    
    function addCheckpoint(
        uint256 _shipmentId,
        string memory _location,
        string memory _remarks,
        int256 _latitude,
        int256 _longitude,
        uint256 _temperature,
        uint256 _humidity
    ) 
        public 
        shipmentExists(_shipmentId) 
        onlyActiveUser 
    {
        Shipment storage shipment = shipments[_shipmentId];
        
        require(
            msg.sender == shipment.from || 
            msg.sender == shipment.to || 
            users[msg.sender].role == Role.Distributor,
            "Unauthorized to add checkpoint"
        );
        
        shipment.checkpoints.push(Checkpoint({
            handler: msg.sender,
            location: _location,
            timestamp: block.timestamp,
            remarks: _remarks,
            status: products[shipment.productId].status,
            latitude: _latitude,
            longitude: _longitude,
            temperature: _temperature,
            humidity: _humidity
        }));
        
        if (shipment.status == ShipmentStatus.Pending) {
            shipment.status = ShipmentStatus.InTransit;
            emit ShipmentStatusUpdated(_shipmentId, ShipmentStatus.InTransit);
        }
        
        emit CheckpointAdded(_shipmentId, msg.sender, _location);
    }
    
    function completeShipment(uint256 _shipmentId) 
        public 
        shipmentExists(_shipmentId) 
        onlyActiveUser 
    {
        Shipment storage shipment = shipments[_shipmentId];
        require(msg.sender == shipment.to, "Only recipient can complete shipment");
        require(shipment.status != ShipmentStatus.Delivered, "Shipment already delivered");
        
        shipment.status = ShipmentStatus.Delivered;
        shipment.actualArrival = block.timestamp;
        products[shipment.productId].status = ProductStatus.Delivered;

        productOwnershipHistory[shipment.productId].push(msg.sender);
        userProducts[msg.sender].push(shipment.productId);

        if (block.timestamp > shipment.expectedArrival) {
            shipment.status = ShipmentStatus.Delayed;
        }
        
        emit ShipmentStatusUpdated(_shipmentId, shipment.status);
        emit ProductTransferred(shipment.productId, shipment.from, shipment.to);
    }
    
    function getShipment(uint256 _shipmentId) 
        public 
        view 
        shipmentExists(_shipmentId) 
        returns (
            uint256 shipmentId,
            uint256 productId,
            address from,
            address to,
            uint256 departureTime,
            uint256 expectedArrival,
            uint256 actualArrival,
            ShipmentStatus status,
            string memory trackingNumber,
            string memory vehicleInfo
        ) 
    {
        Shipment storage shipment = shipments[_shipmentId];
        return (
            shipment.shipmentId,
            shipment.productId,
            shipment.from,
            shipment.to,
            shipment.departureTime,
            shipment.expectedArrival,
            shipment.actualArrival,
            shipment.status,
            shipment.trackingNumber,
            shipment.vehicleInfo
        );
    }
    
    function getShipmentCheckpoints(uint256 _shipmentId) 
        public 
        view 
        shipmentExists(_shipmentId) 
        returns (Checkpoint[] memory) 
    {
        return shipments[_shipmentId].checkpoints;
    }
    
    function getProductShipments(uint256 _productId) 
        public 
        view 
        productExists(_productId) 
        returns (uint256[] memory) 
    {
        return productShipments[_productId];
    }
    
    function getProductOwnershipHistory(uint256 _productId) 
        public 
        view 
        productExists(_productId) 
        returns (address[] memory) 
    {
        return productOwnershipHistory[_productId];
    }
    
    function getUserProducts(address _userAddress) 
        public 
        view 
        returns (uint256[] memory) 
    {
        return userProducts[_userAddress];
    }
    function getTotalProducts() public view returns (uint256) {
        return productCounter;
    }
    
    function getTotalShipments() public view returns (uint256) {
        return shipmentCounter;
    }
    
    function getProductsByStatus(ProductStatus _status) 
        public 
        view 
        returns (uint256[] memory) 
    {
        uint256[] memory tempProducts = new uint256[](productCounter);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= productCounter; i++) {
            if (products[i].status == _status) {
                tempProducts[count] = i;
                count++;
            }
        }
        
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = tempProducts[i];
        }
        
        return result;
    }
}
