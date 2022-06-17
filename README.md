# HoloNext Scraper Demo

With this web application, you can add your stores to the logged-in user. After adding new applications to your online store, this web application will give you the differences between your online store and current database. By clicking the differences you can add these new applications to the database.

## Path

First go to the http://localhost:8080/ and register an account if you don't have it yet. 

Then login to that user and you will be redirected to the root page. Enter your full store url link (for example https://apps.apple.com/us/developer/toprak-yildirim/id1598138404?see-all=i-phonei-pad-apps) and click to the add store button. This will add your store & games to the database. 

By clicking get data button, you can get the differences between URL gameList and database gameList. Note that you don't have to enter any url to click getData button (you already added the store). 

In every 30 seconds, differences in the gameList's will be displayed. By clicking them you can add to the database. 

Have fun! @yigitcanayaz

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
