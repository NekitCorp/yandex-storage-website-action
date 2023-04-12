# Yandex Object Storage static website hosting GitHub action

[Hosting setup](https://cloud.yandex.com/en/docs/storage/operations/hosting/setup)

## Configuration

| Key                 | Value                                                                                                                                                                                                        | Default                  | Required |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ | -------- |
| `access-key-id`     | The ID of the key that you received when [generating the static key](https://cloud.yandex.com/en/docs/iam/operations/sa/create-access-key).                                                                  |                          | ✅       |
| `secret-access-key` | The secret key that you received when [generating the static key](https://cloud.yandex.com/en/docs/iam/operations/sa/create-access-key).                                                                     |                          | ✅       |
| `bucket`            | Bucket name.                                                                                                                                                                                                 |                          | ✅       |
| `working-directory` | Specify the working directory of where to run the action. The working directory is the directory in which the action is running and is used as the base directory for any relative paths used by the action. | `root project directory` | ❌       |
| `include`           | Include [patterns](https://github.com/isaacs/node-glob#glob-primer) for files. Collects all files in the `working-directory` by default.                                                                     | `["**/*"]`               | ❌       |
| `exclude`           | Exclude [patterns](https://github.com/isaacs/node-glob#glob-primer) for files.                                                                                                                               | `[]`                     | ❌       |
| `clear`             | Clear bucket before deploy.                                                                                                                                                                                  | `false`                  | ❌       |

## Examples

### Hosting full build directory

```yaml
name: Deploy

on:
    push:
        branches: [main]

jobs:
    deploy:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3
            - uses: actions/setup-node@v3
              with:
                  node-version: 16
            # Build
            - run: npm ci
            - run: npm run build
            # Deploy
            - uses: nekitcorp/yandex-storage-website-action@v2
              with:
                  access-key-id: ${{ secrets.ACCESS_KEY_ID }}
                  secret-access-key: ${{ secrets.SECRET_ACCESS_KEY }}
                  bucket: ${{ secrets.BUCKET }}
                  working-directory: build
                  clear: true
```

### Exclude some files

```yaml
name: Deploy

on:
    push:
        branches: [main]

jobs:
    deploy:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3
            - uses: actions/setup-node@v3
              with:
                  node-version: 16
            # Build
            - run: npm ci
            - run: npm run build
            # Deploy
            - uses: nekitcorp/yandex-storage-website-action@v2
              with:
                  access-key-id: ${{ secrets.ACCESS_KEY_ID }}
                  secret-access-key: ${{ secrets.SECRET_ACCESS_KEY }}
                  bucket: ${{ secrets.BUCKET }}
                  working-directory: build
                  include: |
                      **/*
                  exclude: |
                      **/*.d.ts
                      package.json
                      README.md
```
