// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract TicketNFT is ERC721, Ownable {
    uint256 public nextTokenId = 1;

    enum Status { Disponivel, Vendido, Revenda }

    struct Ingresso {
        string evento;
        uint256 preco;
        uint256 dataEvento;
        Status status;
    }

    mapping(uint256 => Ingresso) public ingressos;
    mapping(uint256 => bool) private criado;
    // Mapping to track tokens per user for gas efficiency
    mapping(address => uint256[]) private tokensPorUsuario;

    event IngressoCriado(uint256 indexed tokenId, string evento, uint256 preco);
    event IngressoVendido(uint256 indexed tokenId, address indexed comprador, uint256 preco);
    event IngressoRevenda(uint256 indexed tokenId, uint256 novoPreco);

    constructor() ERC721("TicketNFT", "TCKT") Ownable(msg.sender) {}

    function criarIngresso(
        string memory _evento,
        uint256 _preco,
        uint256 _dataEvento
    ) external onlyOwner {
        // Fix: Validate that event date is in the future
        require(_dataEvento > block.timestamp, "Data do evento deve ser futura");

        uint256 tokenId = nextTokenId++;
        _safeMint(owner(), tokenId);

        ingressos[tokenId] = Ingresso({
            evento: _evento,
            preco: _preco,
            dataEvento: _dataEvento,
            status: Status.Disponivel
        });
        criado[tokenId] = true;

        // Add token to owner's collection
        tokensPorUsuario[owner()].push(tokenId);

        emit IngressoCriado(tokenId, _evento, _preco);
    }

    function comprarIngresso(uint256 tokenId) external payable {
        require(criado[tokenId], "Ingresso inexistente");
        Ingresso storage ingresso = ingressos[tokenId];
        address vendedor = ownerOf(tokenId);

        require(ingresso.status != Status.Vendido, "Ja vendido");
        require(msg.value >= ingresso.preco, "Valor insuficiente");
        require(vendedor != msg.sender, "Voce ja eh dono");

        // Fix: Apply CEI pattern (Checks-Effects-Interactions)
        // Effects first: Update state before external call
        ingresso.status = Status.Vendido;
        _transfer(vendedor, msg.sender, tokenId);
        
        // Update token mapping for the new owner
        _removeTokenFromOwner(vendedor, tokenId);
        tokensPorUsuario[msg.sender].push(tokenId);

        // Interactions last: External call after state update
        Address.sendValue(payable(vendedor), msg.value);

        emit IngressoVendido(tokenId, msg.sender, ingresso.preco);
    }

    function revenderIngresso(uint256 tokenId, uint256 novoPreco) external {
        require(criado[tokenId], "Ingresso inexistente");
        require(ownerOf(tokenId) == msg.sender, "Nao eh dono");

        Ingresso storage ingresso = ingressos[tokenId];
        ingresso.preco = novoPreco;
        ingresso.status = Status.Revenda;

        emit IngressoRevenda(tokenId, novoPreco);
    }

    function verificarIngresso(uint256 tokenId) external view returns (bool) {
        return criado[tokenId];
    }

    function statusIngresso(uint256 tokenId) external view returns (Status) {
        require(criado[tokenId], "Ingresso inexistente");
        return ingressos[tokenId].status;
    }

    function atualizarStatus(uint256 tokenId, Status novoStatus) external onlyOwner {
        require(criado[tokenId], "Ingresso inexistente");
        ingressos[tokenId].status = novoStatus;
    }

    function ingressosDoUsuario(address usuario) external view returns (uint256[] memory) {
        // Fix: Return tokens directly from the user mapping for gas efficiency
        return tokensPorUsuario[usuario];
    }

    function listarIngressos() external view returns (uint256[] memory) {
        uint256 total = nextTokenId - 1;
        uint256[] memory tokens = new uint256[](total);
        uint256 index = 0;

        for (uint256 i = 1; i <= total; i++) {
            if (criado[i]) {
                tokens[index++] = i;
            }
        }

        return tokens;
    }

    // Helper function to remove token from owner's collection
    function _removeTokenFromOwner(address owner, uint256 tokenId) private {
        uint256[] storage tokens = tokensPorUsuario[owner];
        uint256 len = tokens.length;
        
        for (uint256 i = 0; i < len; i++) {
            if (tokens[i] == tokenId) {
                // Move last element to current position
                tokens[i] = tokens[len - 1];
                // Remove last element
                tokens.pop();
                break;
            }
        }
    }
}