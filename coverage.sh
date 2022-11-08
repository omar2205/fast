#!/bin/sh

rm -rf cov_profile
deno test --unstable --coverage=cov_profile
deno coverage cov_profile --lcov > cov_profile.lcov