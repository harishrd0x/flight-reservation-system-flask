# backend/schemas/user_schemas.py

from marshmallow import Schema, fields

class UserPublicSchema(Schema):
    id = fields.Int()
    name = fields.Str()
    email = fields.Email()
    role = fields.Str()

# give proper validation for userPUblicSchema

