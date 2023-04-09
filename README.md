# SOLYANKA DAO

SOLYANKA DAO - это децентрализованное автономное сообщество (DAO), предназначенное для проведения голосования в blockchain. Смарт-контракт написал на Hardhat, а фронт-енд написан на React с использованием библиотеки Ant Design для интерфейса и Wagmi/Ethers/RainbowKit для работы с blockchain.

## Особенности

- Создание голосования с указанием заголовка, кандидатов, кворума и длительности.
- Регистрация пользователя для участия в голосованиях.
- Просмотр списка голосований.
- Редактирование голосований, созданных пользователем.
- Уведомления о статусе транзакций.

## Установка

1. Клонируйте репозиторий:

```
git clone https://github.com/SweetBubalehj/DAO-dapp.git
```

2. Установите зависимости для hardhat (для работы с контрактом):

```
cd .\DAO-dapp\app-hardhat\
npm install
```

3. Установите зависимости для react:

```
cd .\DAO-dapp\app-react\
npm install
```

4. Запустите проект react:

```
npm start
```


## Основные компоненты

### App.js

`App.js` содержит основную структуру приложения, включая макет, заголовок с меню, логотипом, кнопкой подключения и разделами контента.

### ABI

Папка `abi` содержит ABI контрактов "factoryABI" и "votingABI", которые используются в приложении. ABI позволяет взаимодействовать с контрактами из blockchain.

### Components

Папка `components` содержит основные компоненты приложения, такие как регистрация, формы создания голосований, редактирования и участия, а также сам список голосований.

- `CreateVotingForm`: Форма для создания нового голосования.
- `CreateIdentityForm`: Форма для регистрации пользователя.
- `VotingList`: Компонент, который отображает список доступных голосований, взаимодействуя с ними используя модальное окно.
- `VotingSettings`: Форма для создателя голосования для его редактирования.
- `VotingModeration`: Форма для модерирования голосований, позволяет модератору изменять их название.

### Utils

Папка `utils` содержит вспомогательные функции, используемые в различных частях приложения, такие как проверка пользователя.

- `isAdmin`: проверка пользователя на права администратора.
- `isIdentified`: проверка пользователя на регистрацию.
- `IsKYC`: проверка пользователя на идентификацию.
- `isModerator`: проверка пользователя на права модератора.

## Использование

1. Подключитесь к кошельку, нажав кнопку "Connect" в правом верхнем углу.
2. Создайте голосование, заполнив форму "Create Voting".
3. Создайте идентификатор, заполнив форму "Create Identity".
4. Просмотрите список активных голосований в разделе "Voting List".
5. Управляйте голосованиями, создавая их, голосуя, изменяя их параметры и наблюдая за статусом транзакций.
