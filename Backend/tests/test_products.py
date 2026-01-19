def test_create_product(client):
    payload = {
        "name": "Test Product",
        "description": "Test Description",
        "price": 100.0,
        "stock": 10
    }

    response = client.post("/products/", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["name"] == "Test Product"
    assert data["price"] == 100.0
    assert data["stock"] == 10


def test_get_all_products(client):
    response = client.get("/products/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_single_product(client):
    response = client.get("/products/1")
    assert response.status_code in [200, 404]


def test_search_products(client):
    response = client.get("/products/search?q=Test")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_update_product(client):
    payload = {
        "price": 150.0,
        "stock": 5
    }

    response = client.put("/products/1", json=payload)
    assert response.status_code in [200, 404]


def test_delete_product(client):
    response = client.delete("/products/1")
    assert response.status_code in [200, 404]
