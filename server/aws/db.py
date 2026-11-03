import boto3
import os

AWS_REGION = os.getenv(
    "AWS_REGION",
    "us-east-1"
)

dynamodb = boto3.resource(
    "dynamodb",
    region_name=AWS_REGION
)

cases_table = dynamodb.Table(
    "indusense-cases"
)

audit_table = dynamodb.Table(
    "indusense-audit"
)


def save_case(case_data):

    cases_table.put_item(
        Item=case_data
    )


def get_case(case_id):

    response = cases_table.get_item(
        Key={
            "case_id": case_id
        }
    )

    return response.get("Item")


def get_all_cases():

    response = cases_table.scan()

    return response.get("Items", [])