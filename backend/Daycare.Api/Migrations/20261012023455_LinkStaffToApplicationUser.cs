using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Daycare.Api.Migrations
{
    /// <inheritdoc />
    public partial class LinkStaffToApplicationUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ApplicationUserId",
                table: "Staff",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Staff_ApplicationUserId",
                table: "Staff",
                column: "ApplicationUserId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Staff_AspNetUsers_ApplicationUserId",
                table: "Staff",
                column: "ApplicationUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Staff_AspNetUsers_ApplicationUserId",
                table: "Staff");

            migrationBuilder.DropIndex(
                name: "IX_Staff_ApplicationUserId",
                table: "Staff");

            migrationBuilder.DropColumn(
                name: "ApplicationUserId",
                table: "Staff");
        }
    }
}
