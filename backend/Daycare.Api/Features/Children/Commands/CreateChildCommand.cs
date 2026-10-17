
using Daycare.Api.Models;
using MediatR;

namespace Daycare.Api.Features.Children.Commands;

public record CreateChildCommand(Child Child) : IRequest<Child>;
