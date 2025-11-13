export const CONTRACT_ABI = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'shipmentId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'handler',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'location',
        type: 'string',
      },
    ],
    name: 'CheckpointAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'productId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'productName',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'manufacturer',
        type: 'address',
      },
    ],
    name: 'ProductCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'productId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'disputedBy',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'reason',
        type: 'string',
      },
    ],
    name: 'ProductDisputed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'productId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'ProductTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'productId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'verifier',
        type: 'address',
      },
    ],
    name: 'ProductVerified',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'shipmentId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'productId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'ShipmentCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'shipmentId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'enum SupplyChain.ShipmentStatus',
        name: 'status',
        type: 'uint8',
      },
    ],
    name: 'ShipmentStatusUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'userAddress',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'enum SupplyChain.Role',
        name: 'role',
        type: 'uint8',
      },
    ],
    name: 'UserRegistered',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_shipmentId',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: '_location',
        type: 'string',
      },
      {
        internalType: 'string',
        name: '_remarks',
        type: 'string',
      },
      {
        internalType: 'int256',
        name: '_latitude',
        type: 'int256',
      },
      {
        internalType: 'int256',
        name: '_longitude',
        type: 'int256',
      },
      {
        internalType: 'uint256',
        name: '_temperature',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_humidity',
        type: 'uint256',
      },
    ],
    name: 'addCheckpoint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_shipmentId',
        type: 'uint256',
      },
    ],
    name: 'completeShipment',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_productName',
        type: 'string',
      },
      {
        internalType: 'string',
        name: '_description',
        type: 'string',
      },
      {
        internalType: 'string',
        name: '_category',
        type: 'string',
      },
      {
        internalType: 'string',
        name: '_batchNumber',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: '_quantity',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: '_qrCodeHash',
        type: 'string',
      },
      {
        internalType: 'string[]',
        name: '_imageHashes',
        type: 'string[]',
      },
    ],
    name: 'createProduct',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_productId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_expectedArrival',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: '_trackingNumber',
        type: 'string',
      },
      {
        internalType: 'string',
        name: '_vehicleInfo',
        type: 'string',
      },
    ],
    name: 'createShipment',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_productId',
        type: 'uint256',
      },
    ],
    name: 'getProduct',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'productId',
            type: 'uint256',
          },
          {
            internalType: 'string',
            name: 'productName',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'description',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'category',
            type: 'string',
          },
          {
            internalType: 'uint256',
            name: 'manufacturingDate',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'manufacturer',
            type: 'address',
          },
          {
            internalType: 'string',
            name: 'batchNumber',
            type: 'string',
          },
          {
            internalType: 'uint256',
            name: 'quantity',
            type: 'uint256',
          },
          {
            internalType: 'enum SupplyChain.ProductStatus',
            name: 'status',
            type: 'uint8',
          },
          {
            internalType: 'bool',
            name: 'isAuthentic',
            type: 'bool',
          },
          {
            internalType: 'uint256',
            name: 'createdAt',
            type: 'uint256',
          },
          {
            internalType: 'string',
            name: 'qrCodeHash',
            type: 'string',
          },
          {
            internalType: 'string[]',
            name: 'imageHashes',
            type: 'string[]',
          },
        ],
        internalType: 'struct SupplyChain.Product',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_productId',
        type: 'uint256',
      },
    ],
    name: 'getProductOwnershipHistory',
    outputs: [
      {
        internalType: 'address[]',
        name: '',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_productId',
        type: 'uint256',
      },
    ],
    name: 'getProductShipments',
    outputs: [
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'enum SupplyChain.ProductStatus',
        name: '_status',
        type: 'uint8',
      },
    ],
    name: 'getProductsByStatus',
    outputs: [
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_shipmentId',
        type: 'uint256',
      },
    ],
    name: 'getShipment',
    outputs: [
      {
        internalType: 'uint256',
        name: 'shipmentId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'productId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'departureTime',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'expectedArrival',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'actualArrival',
        type: 'uint256',
      },
      {
        internalType: 'enum SupplyChain.ShipmentStatus',
        name: 'status',
        type: 'uint8',
      },
      {
        internalType: 'string',
        name: 'trackingNumber',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'vehicleInfo',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_shipmentId',
        type: 'uint256',
      },
    ],
    name: 'getShipmentCheckpoints',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'handler',
            type: 'address',
          },
          {
            internalType: 'string',
            name: 'location',
            type: 'string',
          },
          {
            internalType: 'uint256',
            name: 'timestamp',
            type: 'uint256',
          },
          {
            internalType: 'string',
            name: 'remarks',
            type: 'string',
          },
          {
            internalType: 'enum SupplyChain.ProductStatus',
            name: 'status',
            type: 'uint8',
          },
          {
            internalType: 'int256',
            name: 'latitude',
            type: 'int256',
          },
          {
            internalType: 'int256',
            name: 'longitude',
            type: 'int256',
          },
          {
            internalType: 'uint256',
            name: 'temperature',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'humidity',
            type: 'uint256',
          },
        ],
        internalType: 'struct SupplyChain.Checkpoint[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTotalProducts',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTotalShipments',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_userAddress',
        type: 'address',
      },
    ],
    name: 'getUserInfo',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'userAddress',
            type: 'address',
          },
          {
            internalType: 'string',
            name: 'name',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'email',
            type: 'string',
          },
          {
            internalType: 'enum SupplyChain.Role',
            name: 'role',
            type: 'uint8',
          },
          {
            internalType: 'bool',
            name: 'isActive',
            type: 'bool',
          },
          {
            internalType: 'uint256',
            name: 'registeredAt',
            type: 'uint256',
          },
        ],
        internalType: 'struct SupplyChain.User',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_userAddress',
        type: 'address',
      },
    ],
    name: 'getUserProducts',
    outputs: [
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_productId',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: '_reason',
        type: 'string',
      },
    ],
    name: 'markProductAsDisputed',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'productCounter',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'productOwnershipHistory',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'productShipments',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'products',
    outputs: [
      {
        internalType: 'uint256',
        name: 'productId',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: 'productName',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'description',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'category',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'manufacturingDate',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'manufacturer',
        type: 'address',
      },
      {
        internalType: 'string',
        name: 'batchNumber',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'quantity',
        type: 'uint256',
      },
      {
        internalType: 'enum SupplyChain.ProductStatus',
        name: 'status',
        type: 'uint8',
      },
      {
        internalType: 'bool',
        name: 'isAuthentic',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'createdAt',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: 'qrCodeHash',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    name: 'qrCodeToProduct',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_name',
        type: 'string',
      },
      {
        internalType: 'string',
        name: '_email',
        type: 'string',
      },
      {
        internalType: 'enum SupplyChain.Role',
        name: '_role',
        type: 'uint8',
      },
    ],
    name: 'registerUser',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'shipmentCounter',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'shipments',
    outputs: [
      {
        internalType: 'uint256',
        name: 'shipmentId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'productId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'departureTime',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'expectedArrival',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'actualArrival',
        type: 'uint256',
      },
      {
        internalType: 'enum SupplyChain.ShipmentStatus',
        name: 'status',
        type: 'uint8',
      },
      {
        internalType: 'string',
        name: 'trackingNumber',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'vehicleInfo',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_userAddress',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: '_isActive',
        type: 'bool',
      },
    ],
    name: 'updateUserStatus',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'userProducts',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'users',
    outputs: [
      {
        internalType: 'address',
        name: 'userAddress',
        type: 'address',
      },
      {
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'email',
        type: 'string',
      },
      {
        internalType: 'enum SupplyChain.Role',
        name: 'role',
        type: 'uint8',
      },
      {
        internalType: 'bool',
        name: 'isActive',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'registeredAt',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_productId',
        type: 'uint256',
      },
    ],
    name: 'verifyProduct',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_qrCodeHash',
        type: 'string',
      },
    ],
    name: 'verifyProductByQR',
    outputs: [
      {
        internalType: 'bool',
        name: 'exists',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'productId',
        type: 'uint256',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'productId',
            type: 'uint256',
          },
          {
            internalType: 'string',
            name: 'productName',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'description',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'category',
            type: 'string',
          },
          {
            internalType: 'uint256',
            name: 'manufacturingDate',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'manufacturer',
            type: 'address',
          },
          {
            internalType: 'string',
            name: 'batchNumber',
            type: 'string',
          },
          {
            internalType: 'uint256',
            name: 'quantity',
            type: 'uint256',
          },
          {
            internalType: 'enum SupplyChain.ProductStatus',
            name: 'status',
            type: 'uint8',
          },
          {
            internalType: 'bool',
            name: 'isAuthentic',
            type: 'bool',
          },
          {
            internalType: 'uint256',
            name: 'createdAt',
            type: 'uint256',
          },
          {
            internalType: 'string',
            name: 'qrCodeHash',
            type: 'string',
          },
          {
            internalType: 'string[]',
            name: 'imageHashes',
            type: 'string[]',
          },
        ],
        internalType: 'struct SupplyChain.Product',
        name: 'product',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];