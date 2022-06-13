# HoloNext Scraper Demo

With this web application, you can add your app store to the logged-in user. After adding new applications to your online store, this web application will give you the differences between your online store and current database. By clicking the differences you can add these new applications to the database.

## Home

**URL:** http://localhost:8080/home

- This page directs you to register/login screen
- Note: You can go to Register or Login Screen without home URL

## Register

**URL:** http://localhost:8080/registration

- With this page you can create your user

## Register API's

#### Create User

```http
  POST /register
```

| Parameter  | Type     | Description                             |
| :--------- | :------- | :-------------------------------------- |
| `username` | `string` | **Required**. Username for created user |
| `password` | `string` | **Required**. Password for created user |

## Login

**URL:** http://localhost:8080/login

- With this page you can login to your user
- NOTE: Without logged-in, you cannot insert or read any data to database

## Login API's

#### Create User

```http
  POST /login
```

| Parameter  | Type     | Description                             |
| :--------- | :------- | :-------------------------------------- |
| `username` | `string` | **Required**. Username for created user |
| `password` | `string` | **Required**. Password for created user |

## Root

**URL:** http://localhost:8080

- **NOTE:** This page requires logged-in user
- With this page you can add store (Add Store Button)
- With this page you can get differences between online store and database (Get Data Button)
- After getting the data, you can add the differences to database by clicking **HREF's**

## Root API's

#### Add Store Button (Triggers Two API's)

####

```http
  POST /getdata
```

| Parameter     | Type     | Description                                  |
| :------------ | :------- | :------------------------------------------- |
| `appStoreUrl` | `string` | **Required**. App Store Url for adding store |

```http
  POST /addStore
```

| Parameter     | Type     | Description                                               |
| :------------ | :------- | :-------------------------------------------------------- |
| `name`        | `string` | **Required**. Adding name of the store to database        |
| `publisherId` | `string` | **Required**. Adding publisherId of the store to database |
| `appStoreUrl` | `string` | **Required**. Adding appStoreUrl of the store to database |
| `gameList`    | `array`  | **Required**. Adding gameList of the store to database    |

---

#### Get Data Button (Triggers One API)

```http
  POST /compare
```

| Parameter | Type | Description |
| :-------- | :--- | :---------- |
|           |      |             |

#### HREF (Clicking Triggers Two API's)

```http
  POST /addDifferences
```

| Parameter       | Type     | Description                                               |
| :-------------- | :------- | :-------------------------------------------------------- |
| `differenceUrl` | `string` | **Required**. Adding database's gamelist the clicked href |

```http
  POST /removeDifferences
```

| Parameter       | Type     | Description                                                       |
| :-------------- | :------- | :---------------------------------------------------------------- |
| `differenceUrl` | `string` | **Required**. Removing database's differencelist the clicked href |
