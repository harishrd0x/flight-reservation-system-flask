# backend/schemas/auth_schema.py

from marshmallow import Schema, fields, validate

class RegisterUserSchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=1))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6))
    role = fields.Str(required=True, validate=validate.OneOf(["USER", "ADMIN"]))
    gender = fields.Str(required=True, validate=validate.OneOf(["M", "F"]))
    mobile_number = fields.Str(required=True, validate=validate.Length(equal=10))

# TODO: Add schema for login and update user if needed