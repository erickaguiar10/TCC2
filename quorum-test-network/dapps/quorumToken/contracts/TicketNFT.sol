// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

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

    event IngressoCriado(uint256 indexed tokenId, string evento, uint256 preco);
    event IngressoVendido(uint256 indexed tokenId, address indexed comprador, uint256 preco);
    event IngressoRevenda(uint256 indexed tokenId, uint256 novoPreco);

    constructor() ERC721("TicketNFT", "TCKT") {}

    function criarIngresso(
        string memory _evento,
        uint256 _preco,
        uint256 _dataEvento
    ) external onlyOwner {
        uint256 tokenId = nextTokenId++;
        _safeMint(owner(), tokenId);

        ingressos[tokenId] = Ingresso({
            evento: _evento,
            preco: _preco,
            dataEvento: _dataEvento,
            status: Status.Disponivel
        });
        criado[tokenId] = true;

        emit IngressoCriado(tokenId, _evento, _preco);
    }

    function comprarIngresso(uint256 tokenId) external payable {
        require(criado[tokenId], "Ingresso inexistente");
        Ingresso storage ingresso = ingressos[tokenId];
        address vendedor = ownerOf(tokenId);

        require(ingresso.status != Status.Vendido, "Ja vendido");
        require(msg.value >= ingresso.preco, "Valor insuficiente");
        require(vendedor != msg.sender, "Voce ja eh dono");

        ingresso.status = Status.Vendido;
        payable(vendedor).transfer(msg.value);
        _transfer(vendedor, msg.sender, tokenId);

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
        uint256 total = nextTokenId - 1;
        uint256 count = 0;

        for (uint256 i = 1; i <= total; i++) {
            if (_exists(i) && ownerOf(i) == usuario) {
                count++;
            }
        }

        uint256[] memory tokens = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= total; i++) {
            if (_exists(i) && ownerOf(i) == usuario) {
                tokens[index++] = i;
            }
        }

        return tokens;
    }

    function listarIngressos() external view returns (uint256[] memory) {
        uint256 total = nextTokenId - 1;
        uint256[] memory tokens = new uint256[](total);
        uint256 index = 0;

        for (uint256 i = 1; i <= total; i++) {
            if (_exists(i)) {
                tokens[index++] = i;
            }
        }

        return tokens;
    }
}
