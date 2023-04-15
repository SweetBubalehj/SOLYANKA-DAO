export const Address = "0xF840C81dB1958227c4021143Dd7E949c881C3600";

export const ABI = [
  {
    inputs: [
      { internalType: "string", name: "_title", type: "string" },
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "string", name: "_email", type: "string" },
      { internalType: "uint8", name: "_age", type: "uint8" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "addModerator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "addrSoul", type: "address" }],
    name: "checkIdentity",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "addrSoul", type: "address" }],
    name: "checkKYC",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "string", name: "_email", type: "string" },
      { internalType: "uint8", name: "_age", type: "uint8" },
    ],
    name: "createSoul",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "addrSoul", type: "address" }],
    name: "deleteSoul",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "addrSoul", type: "address" }],
    name: "getOwner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "addrSoul", type: "address" }],
    name: "getRole",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "addrSoul", type: "address" }],
    name: "getSoul",
    outputs: [
      {
        components: [
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "email", type: "string" },
          { internalType: "uint8", name: "age", type: "uint8" },
          { internalType: "bool", name: "KYC", type: "bool" },
          { internalType: "uint8", name: "roleWeight", type: "uint8" },
          { internalType: "address", name: "owner", type: "address" },
        ],
        internalType: "struct SBToken.Soul",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "removeModerator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "title",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "addrSoul", type: "address" },
      { internalType: "bool", name: "_kyc", type: "bool" },
    ],
    name: "turnKYC",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "string", name: "_email", type: "string" },
      { internalType: "uint8", name: "_age", type: "uint8" },
    ],
    name: "updateDataSoul",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
