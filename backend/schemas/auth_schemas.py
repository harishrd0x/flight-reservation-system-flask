# backend/schemas/auth_schemas.py

from marshmallow import Schema, fields, validate


class RegisterSchema(Schema):
    name = fields.Str(required=True)
    email = fields.Email(required=True)
    password = fields.Str(required=True, load_only=True)
    mobile_number = fields.Str(required=True)
    role = fields.Str(required=True, validate=validate.OneOf(["ADMIN", "USER"]))
    gender = fields.Str(required=True, validate=validate.OneOf(["M", "F", "O"]))


class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, load_only=True)


class AuthResponseSchema(Schema):
    id = fields.Int()
    email = fields.Email()
    token = fields.Str()


# TODO: Add schema for  update user if needed