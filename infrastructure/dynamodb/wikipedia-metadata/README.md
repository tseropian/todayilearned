### Features

-  Create the `til-wikipedia-metadata` DynamoDB table used to cache Wikipedia category lookups (see `tools/fetch-wikipedia-metadata.js`).

Create the Wikipedia metadata cache DynamoDB table using Terraform
-------------

**Files:**
```
    main.tf:
    variables.tf
```

**Commands:**

Run these from `infrastructure/dynamodb/wikipedia-metadata/`:

```
    terraform init
```

```
    terraform plan -var="access_key=<AWS_ACCESS_KEY_ID>" -var="secret_key=<AWS_SECRET_ACCESS_KEY>"
```

```
    terraform apply -var="access_key=<AWS_ACCESS_KEY_ID>" -var="secret_key=<AWS_SECRET_ACCESS_KEY>"
```

```
    terraform destroy
```

`access_key`/`secret_key` can also be supplied via a local (untracked) `terraform.tfvars` file, or via the `TF_VAR_access_key` / `TF_VAR_secret_key` environment variables, instead of `-var` flags.

**Note:** this table is not created by CI/CD — it must be applied manually, once, before running `node tools/fetch-wikipedia-metadata.js`. The script will still run without the table (it falls back to fetching everything from the Wikipedia API on every run), but nothing will be cached.
