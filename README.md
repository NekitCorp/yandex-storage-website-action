# Yandex Object Storage static website hosting GitHub action

[Hosting setup](https://cloud.yandex.com/en/docs/storage/operations/hosting/setup)

## Configuration

| Key                 | Value                                                                                                                                       | Default | Required |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| `access-key-id`     | The ID of the key that you received when [generating the static key](https://cloud.yandex.com/en/docs/iam/operations/sa/create-access-key). |         | Yes      |
| `secret-access-key` | The secret key that you received when [generating the static key](https://cloud.yandex.com/en/docs/iam/operations/sa/create-access-key).    |         | Yes      |
| `bucket`            | Bucket name.                                                                                                                                |         | Yes      |
| `include`           | Include [patterns](https://github.com/isaacs/node-glob#glob-primer) for files.                                                              |         | Yes      |
| `exclude`           | Exclude [patterns](https://github.com/isaacs/node-glob#glob-primer) for files.                                                              | `[]`    | No       |
| `clear`             | Clear bucket before deploy.                                                                                                                 | `false` | No       |

## Example

```yaml
name: Deploy

on:
    push:
        branches:
            - master

jobs:
    deploy:
        runs-on: ubuntu-latest
        strategy:
            matrix:
                node-version: [16.x]
        steps:
            - uses: actions/checkout@v3
            - uses: actions/setup-node@v3
              with:
                  node-version: ${{ matrix.node-version }}
            # Build
            - run: npm ci
            - run: npm run build
            # Deploy
            - uses: nekitcorp/yandex-storage-website-action@v2
              with:
                  access-key-id: ${{ secrets.ACCESS_KEY_ID }}
                  secret-access-key: ${{ secrets.SECRET_ACCESS_KEY }}
                  bucket: ${{ secrets.BUCKET }}
                  include: |
                      **/*
                  exclude: |
                      .gitignore
                      package-lock.json
                      node_modules/**
                  clear: true
```
