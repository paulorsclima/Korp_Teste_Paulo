# Sistema de Emisssão de Notas Fiscais - Korp

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com)
[![Angular](https://img.shields.io/badge/Angular-17-DD0031?logo=angular)](https://angular.io)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-Azure-CC2927?logo=microsoft-sql-server)](https://azure.microsoft.com)

Sistema de Emissão de Notas Fiscais — Korp
Sistema de emissão de notas fiscais desenvolvido para processo seletivo da Korp, utilizando Angular no frontend e .NET 8 no backend, organizado em dois microsserviços.

Visão geral
A aplicação é composta por:

StockService: responsável pelo cadastro e consulta de produtos e saldos de estoque.

InvoicingService: responsável pelo cadastro, consulta e gerenciamento de notas fiscais e seus itens.

Frontend Angular: interface para interação com produtos e notas fiscais.

SQL Server: banco de dados utilizado pelos serviços, hospedado no Azure ou executado localmente.

Arquitetura
text
Frontend Angular
      │
      ├── StockService — http://localhost:5001
      │       └── Produtos e estoque
      │
      └── InvoicingService — http://localhost:5002
              └── Notas fiscais e itens

SQL Server / Azure SQL
Microsserviços
Serviço	Porta	Responsabilidade
StockService	5001	Cadastro e consulta de produtos e estoque
InvoicingService	5002	Cadastro e consulta de notas fiscais e itens
Frontend
Angular 17+

Angular Material

RxJS

HttpClient

Banco de dados
SQL Server / Azure SQL

Entity Framework Core

Migrations para criação e atualização da estrutura do banco

Funcionalidades
Produtos
Cadastro de produtos.

Código do produto.

Descrição ou nome.

Saldo disponível em estoque.

Listagem e consulta de produtos.

Validação de código duplicado no cadastro.

Notas fiscais
Criação de notas fiscais.

Numeração gerada pelo sistema.

Status da nota.

Inclusão de múltiplos produtos.

Definição da quantidade de cada item.

Consulta de notas e respectivos itens.

Comunicação com o serviço de estoque durante o processo de faturamento.

APIs
As APIs podem ser testadas pelo Swagger:

Swagger — StockService

Swagger — InvoicingService

Os endpoints disponíveis dependem da implementação atual de cada serviço. As operações de consulta e criação devem ser testadas pelo Swagger antes da apresentação.

Requisitos
.NET 8 SDK.

Node.js 18 ou superior.

npm.

SQL Server local ou Azure SQL.

Acesso ao banco configurado para a máquina que executará os serviços.

Configuração do banco de dados
Crie ou utilize um banco SQL Server, por exemplo, KorpTeste, e configure a connection string nos arquivos:

text
backend/StockService/appsettings.json
backend/InvoicingService/appsettings.json
Exemplo de configuração:

json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=tcp:SEU_SERVIDOR.database.windows.net,1433;Database=KorpTeste;User ID=SEU_USUARIO;Password=SUA_SENHA;Encrypt=True;TrustServerCertificate=False;"
  }
}
Não versionar senhas, tokens ou connection strings reais no repositório. Utilize variáveis de ambiente ou configuração local para informações sensíveis.

Como executar
StockService
Abra um terminal:

powershell
cd "C:\Projetos\Korp_Teste_Paulo\backend\StockService"
dotnet build
dotnet ef database update
dotnet run --urls="http://localhost:5001"
Swagger:

text
http://localhost:5001/swagger/index.html
InvoicingService
Abra outro terminal:

powershell
cd "C:\Projetos\Korp_Teste_Paulo\backend\InvoicingService"
dotnet build
dotnet ef database update
dotnet run --urls="http://localhost:5002"
Swagger:

text
http://localhost:5002/swagger/index.html
O InvoicingService deve ser executado com o StockService disponível na porta 5001, pois os serviços se comunicam durante o fluxo de faturamento.

Frontend
Abra um terceiro terminal:

powershell
cd "C:\Projetos\Korp_Teste_Paulo\frontend"
npm install
npx ng serve
Acesse:

text
http://localhost:4200
No uso diário, quando as dependências já estiverem instaladas, normalmente basta executar:

powershell
npx ng serve
Ordem recomendada para os testes
Iniciar o StockService na porta 5001.

Iniciar o InvoicingService na porta 5002.

Iniciar o frontend Angular.

Cadastrar ou consultar um produto.

Criar uma nota fiscal.

Adicionar um ou mais produtos à nota.

Consultar a nota e confirmar seus itens e status.

Testar o fluxo de fechamento ou impressão somente se estiver disponível na versão atual.

Tratamento de falhas
As chamadas entre os serviços podem utilizar Polly para tratar erros temporários de comunicação e realizar novas tentativas.

Exemplo de política de retry:

csharp
static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy()
{
    return HttpPolicyExtensions
        .HandleTransientHttpError()
        .WaitAndRetryAsync(
            3,
            retryAttempt => TimeSpan.FromSeconds(
                Math.Pow(2, retryAttempt)));
}
Essa política representa novas tentativas para falhas transitórias. O uso de circuit breaker só deve ser declarado caso exista uma configuração específica dessa política no código.

Detalhes técnicos
Backend
.NET 8.

C#.

Entity Framework Core.

SQL Server / Azure SQL.

LINQ.

Swagger/OpenAPI com Swashbuckle.

NuGet para gerenciamento de pacotes.

Arquivos .csproj para configuração dos projetos.

Exemplos de consultas LINQ utilizadas no projeto:

csharp
await db.Products
    .OrderBy(p => p.Description)
    .ToListAsync();

await db.Products
    .AnyAsync(p => p.Code == product.Code);

await db.Invoices
    .Include(i => i.Items)
    .FirstOrDefaultAsync(i => i.Id == id);
Frontend
Angular 17+.

Angular Material para os componentes visuais.

RxJS para programação reativa.

HttpClient para chamadas HTTP.

Componentes de listagem e formulários.

Tratamento de respostas e erros nas chamadas dos serviços.

Uso do ciclo de vida OnInit para carregamento inicial dos dados.

Estrutura do projeto
text
Korp_Teste_Paulo/
├── backend/
│   ├── StockService/
│   │   ├── Data/
│   │   ├── Migrations/
│   │   ├── Models/
│   │   ├── Program.cs
│   │   ├── StockService.csproj
│   │   └── appsettings.json
│   │
│   └── InvoicingService/
│       ├── Data/
│       ├── Migrations/
│       ├── Models/
│       ├── Program.cs
│       ├── InvoicingService.csproj
│       └── appsettings.json
│
└── frontend/
    ├── src/
    ├── angular.json
    ├── package.json
    └── tsconfig.json
Limpeza de dados de teste
Para excluir dados de teste, prefira utilizar endpoints de exclusão disponíveis no Swagger. Caso seja necessário realizar a limpeza diretamente no Azure SQL, confirme primeiro o banco e os registros e faça backup antes de executar comandos DELETE.

Ao excluir dados relacionados, remova primeiro os itens da nota e depois a nota principal, respeitando as chaves estrangeiras.

Não utilize DROP TABLE nem dotnet ef database drop para uma simples limpeza de registros.

Validação da criação de uma nota
Após criar uma nota pelo frontend ou Swagger:

Verifique se a API retornou sucesso.

Copie o ID retornado.

Consulte a lista de notas.

Consulte a nota pelo ID.

Confirme os itens e o status retornados.

Autor
Paulo Ricardo S C Lima

GitHub: @paulorsclima

LinkedIn: Paulo Ricardo Cardoso

E-mail: paulo.rsclima@gmail.com

Licença
Projeto desenvolvido para processo seletivo da Korp.
Projeto desenvolvido para processo seletivo - Korp
