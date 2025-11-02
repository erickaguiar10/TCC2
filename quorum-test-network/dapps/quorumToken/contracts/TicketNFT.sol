// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// Importa a extensão Enumerable
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol"; 
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Adiciona ERC721Enumerable à herança
contract TicketNFT is ERC721Enumerable, Ownable, ReentrancyGuard {
    uint256 public nextTokenId = 1;

    enum Status { Disponivel, Vendido, Revenda }

    struct Ingresso {
        string evento;
        uint256 preco;
        uint256 dataEvento;
        Status status;
    }

    mapping(uint256 => Ingresso) public ingressos;
    // Mappings 'criado' e 'tokensByOwner' foram removidos (agora gerenciados pelo ERC721Enumerable)

    event IngressoCriado(uint256 indexed tokenId, string evento, uint256 preco, uint256 dataEvento);
    event IngressoVendido(uint256 indexed tokenId, address indexed comprador, uint256 preco);
    event IngressoRevenda(uint256 indexed tokenId, uint256 novoPreco);

    constructor() ERC721("TicketNFT", "TCKT") Ownable(msg.sender) {}

    function criarIngresso(
        string memory _evento,
        uint256 _preco,
        uint256 _dataEvento
    ) external onlyOwner {
        // Validation: Event date must be in the future
        require(_dataEvento > block.timestamp, "Data do evento deve ser futura");
        
        uint256 tokenId = nextTokenId++;
        // _safeMint já aciona o hook do ERC721Enumerable para adicionar o token ao dono
        _safeMint(owner(), tokenId);

        ingressos[tokenId] = Ingresso({
            evento: _evento,
            preco: _preco,
            dataEvento: _dataEvento,
            status: Status.Disponivel
        });
        // 'criado[tokenId] = true' removido
        // 'tokensByOwner[owner()].push(tokenId)' removido (corrigindo bug)

        emit IngressoCriado(tokenId, _evento, _preco, _dataEvento);
    }

    function comprarIngresso(uint256 tokenId) external payable nonReentrant {
        // Usa ownerOf para verificar se o token existe
        require(ownerOf(tokenId) != address(0), "Ingresso inexistente"); 
        
        Ingresso storage ingresso = ingressos[tokenId];
        address vendedor = ownerOf(tokenId);

        // A lógica '!= Vendido' permite comprar se estiver Disponivel ou em Revenda
        require(ingresso.status != Status.Vendido, "Ingresso nao esta a venda"); 
        require(msg.value >= ingresso.preco, "Valor insuficiente");
        require(vendedor != msg.sender, "Voce ja eh dono");

        // Update state first (Effects)
        ingresso.status = Status.Vendido;
        
        // 'tokensByOwner' logic removida (corrigindo bug)
        
        // Transfer ETH (Interactions) - Safe transfer with error handling
        (bool success, ) = payable(vendedor).call{value: msg.value}("");
        require(success, "Transfer failed");
        
        // _transfer já aciona o hook do ERC721Enumerable para atualizar os donos
        _transfer(vendedor, msg.sender, tokenId);

        emit IngressoVendido(tokenId, msg.sender, ingresso.preco);
    }

    function revenderIngresso(uint256 tokenId, uint256 novoPreco) external {
        require(ownerOf(tokenId) != address(0), "Ingresso inexistente");
        require(ownerOf(tokenId) == msg.sender, "Nao eh dono");

        Ingresso storage ingresso = ingressos[tokenId];
        ingresso.preco = novoPreco;
        ingresso.status = Status.Revenda;

        emit IngressoRevenda(tokenId, novoPreco);
    }

    function verificarIngresso(uint256 tokenId) external view returns (bool) {
        // Verifica se o token existe verificando se tem dono
        try this.ownerOf(tokenId) returns (address) {
            return true; // Se não lançar erro, o token existe
        } catch {
            return false; // Se lançar erro, o token não existe
        }
    }

    function statusIngresso(uint256 tokenId) external view returns (Status) {
        require(ownerOf(tokenId) != address(0), "Ingresso inexistente");
        return ingressos[tokenId].status;
    }

    function dataEvento(uint256 tokenId) external view returns (uint256) {
        require(ownerOf(tokenId) != address(0), "Ingresso inexistente");
        return ingressos[tokenId].dataEvento;
    }

    function atualizarStatus(uint256 tokenId, Status novoStatus) external onlyOwner {
        require(ownerOf(tokenId) != address(0), "Ingresso inexistente");
        ingressos[tokenId].status = novoStatus;
    }

    /**
     * @dev Retorna a lista de token IDs de um usuário.
     * Implementação otimizada usando ERC721Enumerable.
     */
    function ingressosDoUsuario(address usuario) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(usuario);
        uint256[] memory tokens = new uint256[](balance);
        for (uint256 i = 0; i < balance; i++) {
            tokens[i] = tokenOfOwnerByIndex(usuario, i);
        }
        return tokens;
    }

    function listarIngressos() external view returns (uint256[] memory) {
        uint256 total = totalSupply();
        uint256[] memory tokens = new uint256[](total);
        for (uint256 i = 0; i < total; i++) {
            tokens[i] = tokenByIndex(i);
        }
        return tokens;
    }
}