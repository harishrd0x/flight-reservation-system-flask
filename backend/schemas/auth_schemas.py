from marshmallow import Schema, fields, validate


class RegisterUserSchema(Schema):
    username = fields.Str(required=True, validate=validate.Length(min=3))
    email = fields.Email(required=True)
    password = fields.Str(required=True, load_only=True, validate=validate.Length(min=6))

    # TODO: Add custom validation (e.g., strong password rules)
