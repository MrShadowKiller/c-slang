#include <source_stdlib>

int main() {
  int y = 10;
  int x = (y++ + 12) - (8 - --y) * ++y - y--;
  print_int(x);
  print_int(y);
}