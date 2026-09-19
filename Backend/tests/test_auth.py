from app.core.security import hash_password, verify_password, create_access_token, decode_access_token


def test_password_hashing_and_verification():
    raw_pass = "secureFarmerPass2026!"
    hashed = hash_password(raw_pass)

    assert hashed != raw_pass
    assert verify_password(raw_pass, hashed)
    assert not verify_password("wrong_password", hashed)


def test_jwt_token_generation_and_decoding():
    payload = {"sub": "user_12345", "email": "test@mitra.org"}
    token = create_access_token(payload)

    assert isinstance(token, str)
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "user_12345"
    assert decoded["email"] == "test@mitra.org"
