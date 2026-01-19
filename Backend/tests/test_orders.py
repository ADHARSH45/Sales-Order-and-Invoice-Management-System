def test_create_order(client):
    payload = {
        "customer": {
            "name": "Test User",
            "email": "test@gmail.com",
            "phone": "9999999999",
            "address": "Test Address"
        },
        "items": [
            {
                "product_id": 1,
                "quantity": 1
            }
        ]
    }

    response = client.post("/orders/", json=payload)
    assert response.status_code in [200, 201, 404]


def test_get_all_orders(client):
    response = client.get("/orders/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_single_order(client):
    response = client.get("/orders/1")
    assert response.status_code in [200, 404]


def test_generate_invoice(client):
    response = client.post("/orders/1/generate_invoice")
    assert response.status_code in [200, 404]


def test_pay_order(client):
    response = client.post("/orders/1/paid")
    assert response.status_code in [200, 400, 404]


def test_delete_order(client):
    response = client.delete("/orders/1")
    assert response.status_code in [200, 404]
