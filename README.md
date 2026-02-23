# eControle App

Aplicativo móvel para controle de ordens de serviço, rotas e emissão de MTRs (Manifesto de Transporte de Resíduos).

## 📱 Tecnologias

- **React Native** 0.74.5
- **Expo SDK** 51
- **TypeScript** 5.3
- **SQLite** (persistência local)
- **Axios** (requisições HTTP)
- **Zustand** (gerenciamento de estado)
- **React Hook Form** + **Zod** (formulários e validação)

## 🚀 Como Rodar

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo CLI
- Android Studio (para Android) ou Xcode (para iOS)

### Instalação

```bash
# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm start
```

### Configuração de Rede

O arquivo `app.json` está configurado com `"hostType": "lan"` para que o Metro Bundler use o IP da sua rede local em vez de `127.0.0.1`.

**Importante:** Certifique-se de que seu dispositivo móvel e computador estejam na **mesma rede Wi-Fi**.

### Comandos Disponíveis

```bash
npm start          # Inicia o Expo Dev Server
npm run android    # Roda no Android (emulador ou dispositivo)
npm run ios        # Roda no iOS (simulador)
npm test           # Roda os testes
npm run test:watch # Roda testes em modo watch
npm run typecheck  # Verificação de tipos TypeScript
```

## 🔧 Correção de Problemas de Rede

### Problema: App conectando em 127.0.0.1 ou localhost

Quando você escaneia o QR Code do Expo Go, o domínio pode ser salvo como `127.0.0.1` ou `localhost`, o que impede a conexão com a API no dispositivo físico.

**Solução implementada:**

1. **Configuração automática**: O `app.json` está configurado com `"hostType": "lan"` para usar o IP da rede local
2. **Correção em tempo de execução**: O app detecta automaticamente domínios localhost e os substitui pelo IP da rede Wi-Fi
3. **Biblioteca expo-network**: Instalada para obter o IP local do dispositivo

**Se ainda tiver problemas:**

1. Verifique se computador e celular estão na **mesma rede Wi-Fi**
2. Reinicie o Metro Bundler: `npm start -- --clear`
3. Escaneie o QR Code novamente
4. O app deve detectar e corrigir automaticamente o domínio

## 🔐 Autenticação

O app utiliza autenticação via QR Code:

1. Escaneie o QR Code fornecido pelo sistema eControle
2. O domínio da API será salvo automaticamente
3. Faça login com suas credenciais

### Domínio da API

O domínio é obtido automaticamente ao escanear o QR Code e fica salvo no SecureStore. Para desenvolvimento web, o proxy do webpack redireciona as requisições para `https://testeaplicativo.econtrole.com`.

## 🧪 Testes

```bash
# Rodar todos os testes
npm test

# Testes com coverage
npm run test:coverage

# Testes em modo watch (desenvolvimento)
npm run test:watch
```

## 📁 Estrutura do Projeto

```
eControleApp-Pro/
├── app/                    # Telas do aplicativo
│   ├── Authentication/     # Tela de autenticação
│   ├── Login/              # Tela de login
│   ├── QRCodeScanner/      # Scanner de QR Code
│   ├── ListServicesOrder/  # Listagem de ordens de serviço
│   ├── UpdateServicesOrder/# Atualização de ordens de serviço
│   ├── Routes/             # Rotas e viagens
│   └── GenerateMTR/        # Emissão de MTR
├── services/               # Serviços e chamadas de API
├── databases/              # Configuração do SQLite
├── stores/                 # Stores do Zustand
├── routes/                 # Configuração de navegação
├── components/             # Componentes reutilizáveis
├── utils/                  # Funções utilitárias
└── __tests__/              # Testes unitários
```

## 🔧 Configuração de Desenvolvimento

### Expo Dev Server na Rede Local

Para garantir que o Expo use o IP da rede local:

1. O `app.json` já está configurado com `"hostType": "lan"`
2. Inicie o servidor: `npm start`
3. O Metro mostrará um URL como `exp://192.168.x.x:19000`
4. Escaneie o QR Code no app Expo Go

### Problemas Comuns

**Erro: "Couldn't connect to server"**
- Verifique se computador e celular estão na mesma rede Wi-Fi
- Verifique se o firewall não está bloqueando a porta 19000
- Tente reiniciar o Metro: `npm start -- --clear`

**CORS no desenvolvimento Web**
- O webpack.config.js já está configurado com proxy para `/api` e `/login`
- Acesse `http://localhost:8082` (ou a porta indicada no terminal)

## 📦 Build

### Android (APK)

```bash
# Build local
npx eas build --platform android --profile development

# Build para produção
npx eas build --platform android --profile production
```

### iOS

```bash
# Build local
npx eas build --platform ios --profile development
```

## 📝 Licença

© 2026 eControle. Todos os direitos reservados.

## 👨‍💻 Desenvolvedor

Amos Fernandes
