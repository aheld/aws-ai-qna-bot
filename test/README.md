testing infastructure. goal is to run all tests within a codebuild project.
```shell
make #builds template
make up #builds and launches template
```
can use individual scripts localing as well
scripts run in the following order

1) configure.sh
2) setup.sh
3) test.sh
4) teardown.sh

designed to be a single cloudformation template not dependent on the bootstrap template

